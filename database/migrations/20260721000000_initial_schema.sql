-- Rcord Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles (linked to auth.users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique not null,
    avatar_url text,
    points integer default 0 check (points >= 0),
    current_theme text default 'dark',
    current_accent text default 'purple',
    current_border_url text,
    is_admin boolean default false not null,
    birthdate date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

-- 2. Servers
create table public.servers (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    owner_id uuid references public.profiles(id) on delete set null,
    icon_url text,
    is_public boolean default false,
    max_emojis integer default 50 not null,
    max_sounds integer default 10 not null,
    max_categories integer default 15 not null,
    max_channels integer default 100 not null,
    boost_level integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.servers enable row level security;

-- 3. Server Members
create table public.server_members (
    server_id uuid references public.servers(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    role text default 'member' check (role in ('owner', 'admin', 'member')),
    joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (server_id, user_id)
);

alter table public.server_members enable row level security;

-- Server Roles
create table public.server_roles (
    id uuid primary key default gen_random_uuid(),
    server_id uuid references public.servers(id) on delete cascade not null,
    name text not null,
    color text default '#99aab5' not null,
    permissions jsonb default '{}'::jsonb not null,
    position integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.server_roles enable row level security;

-- Member Roles mapping
create table public.member_roles (
    server_id uuid references public.servers(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    role_id uuid references public.server_roles(id) on delete cascade not null,
    primary key (server_id, user_id, role_id)
);

alter table public.member_roles enable row level security;

-- 4. Channel Categories
create table public.channel_categories (
    id uuid primary key default gen_random_uuid(),
    server_id uuid references public.servers(id) on delete cascade,
    name text not null,
    position integer default 0
);

alter table public.channel_categories enable row level security;

-- Category Permissions mapping (Overrides per category)
create table public.category_permissions (
    category_id uuid references public.channel_categories(id) on delete cascade not null,
    role_id uuid references public.server_roles(id) on delete cascade, -- null oznacza @everyone
    allow jsonb default '{}'::jsonb not null,
    deny jsonb default '{}'::jsonb not null,
    primary key (category_id, role_id)
);

alter table public.category_permissions enable row level security;

-- 5. Channels
create table public.channels (
    id uuid primary key default gen_random_uuid(),
    server_id uuid references public.servers(id) on delete cascade, -- null dla DM/Group DM
    category_id uuid references public.channel_categories(id) on delete set null,
    name text, -- null dla DM, nazwa dla Group DM lub kanałów serwera
    type text default 'text' check (type in ('text', 'voice', 'dm', 'group_dm')),
    is_temporary boolean default false,
    is_nsfw boolean default false not null,
    created_by uuid references public.profiles(id) on delete set null,
    position integer default 0
);

alter table public.channels enable row level security;

-- 6. Server Invites
create table public.server_invites (
    code text primary key,
    server_id uuid references public.servers(id) on delete cascade,
    created_by uuid references public.profiles(id) on delete set null,
    max_uses integer default 0,
    uses integer default 0,
    expires_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.server_invites enable row level security;

-- 7. Messages
create table public.messages (
    id uuid primary key default gen_random_uuid(),
    channel_id uuid references public.channels(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete set null,
    content text,
    embeds jsonb default '[]'::jsonb,
    fts_search_vector tsvector generated always as (to_tsvector('english', coalesce(content, ''))) stored,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;

-- Create GIN index for full-text search on messages
create index messages_fts_idx on public.messages using gin(fts_search_vector);

-- 8. Shop Items
create table public.shop_items (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    type text not null check (type in ('border', 'theme', 'game_skin')),
    price integer default 0 check (price >= 0),
    asset_url text,
    details jsonb default '{}'::jsonb
);

alter table public.shop_items enable row level security;

-- 9. User Inventory
create table public.user_inventory (
    user_id uuid references public.profiles(id) on delete cascade,
    item_id uuid references public.shop_items(id) on delete cascade,
    purchased_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (user_id, item_id)
);

alter table public.user_inventory enable row level security;

-- 10. Bot Tokens
create table public.bot_tokens (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    owner_id uuid references public.profiles(id) on delete cascade,
    token_hash text unique not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bot_tokens enable row level security;

-- 11. Chess Matches (Online PvP Chess)
create table public.chess_matches (
    id uuid primary key default gen_random_uuid(),
    player_white uuid references public.profiles(id) on delete set null,
    player_black uuid references public.profiles(id) on delete set null,
    board_state text default 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', -- FEN string
    current_turn text default 'white' check (current_turn in ('white', 'black')),
    status text default 'active' check (status in ('active', 'white_win', 'black_win', 'draw')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.chess_matches enable row level security;

-- Automatic Profile Creation on auth.users registration
create or replace function public.handle_new_user()
returns trigger as $$
declare
    v_base_username text;
    v_discriminator text;
    v_final_username text;
    v_exists boolean;
begin
    v_base_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
    -- Ograniczamy długość bazy nazwy do 15 znaków
    v_base_username := substring(v_base_username from 1 for 15);
    
    -- Pętla generująca unikalny tag #XXXX
    loop
        v_discriminator := lpad(floor(random() * 10000)::text, 4, '0');
        v_final_username := v_base_username || '#' || v_discriminator;
        
        select exists (select 1 from public.profiles where username = v_final_username) into v_exists;
        if not v_exists then
            exit;
        end if;
    end loop;

    insert into public.profiles (id, username, avatar_url)
    values (
        new.id,
        v_final_username,
        new.raw_user_meta_data->>'avatar_url'
    );
    return new;
end;
$$ language plpgsql security definer;


create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Simple RLS Policies (allows authenticated users full read/write for now, to be locked down per server permissions in later migrations)
create policy "Allow read access to profiles for all authenticated" on public.profiles for select to authenticated using (true);
create policy "Allow update access to own profile" on public.profiles for update to authenticated using (auth.uid() = id);

create policy "Allow read access to servers for members" on public.servers for select to authenticated using (
    is_public = true or exists (
        select 1 from public.server_members where server_id = id and user_id = auth.uid()
    )
);
create policy "Allow server creation for all authenticated" on public.servers for insert to authenticated with check (true);
create policy "Allow server update for owner" on public.servers for update to authenticated using (owner_id = auth.uid());

create policy "Allow select members of joined servers" on public.server_members for select to authenticated using (true);
create policy "Allow joining servers" on public.server_members for insert to authenticated with check (true);

create policy "Allow select channel categories" on public.channel_categories for select to authenticated using (true);
create policy "Allow select channels" on public.channels for select to authenticated using (true);
create policy "Allow select invites" on public.server_invites for select to authenticated using (true);
create policy "Allow select messages" on public.messages for select to authenticated using (true);
create policy "Allow insert messages" on public.messages for insert to authenticated with check (user_id = auth.uid());

create policy "Allow select shop items" on public.shop_items for select to authenticated using (true);
create policy "Allow select inventory" on public.user_inventory for select to authenticated using (true);
create policy "Allow buy items" on public.user_inventory for insert to authenticated with check (user_id = auth.uid());

create policy "Allow select bot tokens for owner" on public.bot_tokens for select to authenticated using (owner_id = auth.uid());
create policy "Allow create bot tokens for owner" on public.bot_tokens for insert to authenticated with check (owner_id = auth.uid());

create policy "Allow select chess matches" on public.chess_matches for select to authenticated using (true);
create policy "Allow update chess matches" on public.chess_matches for update to authenticated using (true);
create policy "Allow create chess matches" on public.chess_matches for insert to authenticated with check (true);

-- Secure stored procedure to buy a shop item
create or replace function public.buy_shop_item(p_user_id uuid, p_item_id uuid)
returns void as $$
declare
    v_price integer;
    v_points integer;
begin
    -- 1. Get the item price
    select price into v_price from public.shop_items where id = p_item_id;
    if v_price is null then
        raise exception 'Przedmiot nie istnieje';
    end if;

    -- 2. Get user current points
    select points into v_points from public.profiles where id = p_user_id for update;
    if v_points is null then
        raise exception 'Profil użytkownika nie istnieje';
    end if;

    -- 3. Check if user already owns the item
    if exists (select 1 from public.user_inventory where user_id = p_user_id and item_id = p_item_id) then
        raise exception 'Już posiadasz ten przedmiot';
    end if;

    -- 4. Check if user has enough points
    if v_points < v_price then
        raise exception 'Niewystarczająca liczba punktów';
    end if;

    -- 5. Deduct points and insert into inventory
    update public.profiles set points = points - v_price where id = p_user_id;
    insert into public.user_inventory (user_id, item_id, purchased_at) values (p_user_id, p_item_id, now());
end;
$$ language plpgsql security definer;

-- 13. Channel Members (for DM / Group DM participation)
create table public.channel_members (
    channel_id uuid references public.channels(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    primary key (channel_id, user_id)
);

alter table public.channel_members enable row level security;

-- 14. Relationships (Friends, Blocks)
create table public.relationships (
    user_id uuid references public.profiles(id) on delete cascade,
    friend_id uuid references public.profiles(id) on delete cascade,
    status text not null check (status in ('friends', 'blocked', 'pending_sent', 'pending_received')),
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (user_id, friend_id)
);

alter table public.relationships enable row level security;

-- RLS Policies for new tables
create policy "Allow select channel members of own channels" on public.channel_members for select to authenticated using (
    user_id = auth.uid() or exists (
        select 1 from public.channel_members cm where cm.channel_id = channel_id and cm.user_id = auth.uid()
    )
);
create policy "Allow insert channel members for own channels" on public.channel_members for insert to authenticated with check (true);
create policy "Allow delete channel members" on public.channel_members for delete to authenticated using (user_id = auth.uid());

create policy "Allow select own relationships" on public.relationships for select to authenticated using (user_id = auth.uid());
create policy "Allow insert/update/delete own relationships" on public.relationships for all to authenticated using (user_id = auth.uid());

-- RLS Policies for Roles & Category Permissions
create policy "Allow select server roles" on public.server_roles for select to authenticated using (true);
create policy "Allow modify server roles" on public.server_roles for all to authenticated using (true);

create policy "Allow select member roles" on public.member_roles for select to authenticated using (true);
create policy "Allow modify member roles" on public.member_roles for all to authenticated using (true);

create policy "Allow select category permissions" on public.category_permissions for select to authenticated using (true);
create policy "Allow modify category permissions" on public.category_permissions for all to authenticated using (true);

-- Secure function to change username and tag (e.g. name#1234 or name#PSK)
create or replace function public.change_username_and_tag(
    p_user_id uuid,
    p_new_base text,
    p_new_tag text
)
returns void as $$
declare
    v_final_username text;
    v_exists boolean;
begin
    -- 1. Check if the user is modifying their own profile
    if p_user_id <> auth.uid() then
        raise exception 'Brak uprawnień do zmiany nazwy innego użytkownika';
    end if;

    -- 2. Validate new base username length
    if length(p_new_base) < 2 or length(p_new_base) > 15 then
        raise exception 'Nazwa użytkownika musi mieć od 2 do 15 znaków';
    end if;

    -- 3. Validate new tag length and alphanumeric check (2 to 5 characters)
    if not (p_new_tag ~* '^[a-z0-9]{2,5}$') then
        raise exception 'Tag musi być alfanumeryczny i mieć od 2 do 5 znaków (np. PSK)';
    end if;

    -- 4. Construct final username (standardizing tag to uppercase for consistency)
    v_final_username := p_new_base || '#' || upper(p_new_tag);

    -- 5. Check if the username#tag combo is already taken
    select exists (
        select 1 from public.profiles where username = v_final_username and id <> p_user_id
    ) into v_exists;

    if v_exists then
        raise exception 'Ta nazwa użytkownika z tym tagiem jest już zajęta';
    end if;

    -- 6. Update username
    update public.profiles set username = v_final_username where id = p_user_id;
end;
$$ language plpgsql security definer;

-- 15. Voice States (tracking active speaker sessions)
create table public.voice_states (
    user_id uuid references public.profiles(id) on delete cascade primary key,
    server_id uuid references public.servers(id) on delete cascade, -- null dla DMs
    channel_id uuid references public.channels(id) on delete cascade not null,
    is_muted boolean default false not null,
    is_deafened boolean default false not null,
    is_screen_sharing boolean default false not null,
    is_video_on boolean default false not null,
    joined_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.voice_states enable row level security;

-- RLS Policies for voice states
create policy "Allow select voice states for all authenticated" on public.voice_states for select to authenticated using (true);
create policy "Allow modify own voice state" on public.voice_states for all to authenticated using (user_id = auth.uid());

-- Trigger to automatically delete temporary channels when they become empty
create or replace function public.handle_temporary_channels_cleanup()
returns trigger as $$
declare
    v_old_channel_id uuid;
    v_is_temp boolean;
    v_count integer;
begin
    -- Determine which channel ID was left
    if tg_op = 'DELETE' then
        v_old_channel_id := old.channel_id;
    elsif tg_op = 'UPDATE' then
        v_old_channel_id := old.channel_id;
    end if;

    if v_old_channel_id is not null then
        -- Check if it was a temporary channel
        select is_temporary into v_is_temp from public.channels where id = v_old_channel_id;
        if v_is_temp = true then
            -- Count remaining users in the channel
            select count(*) into v_count from public.voice_states where channel_id = v_old_channel_id;
            if v_count = 0 then
                -- Delete the channel
                delete from public.channels where id = v_old_channel_id;
            end if;
        end if;
    end if;
    return null;
end;
$$ language plpgsql security definer;

create or replace trigger on_voice_state_left
    after delete or update on public.voice_states
    for each row execute procedure public.handle_temporary_channels_cleanup();

-- Batch update channel positions
create or replace function public.update_channel_positions(p_positions jsonb)
returns void as $$
declare
    v_item jsonb;
begin
    for v_item in select * from jsonb_array_elements(p_positions)
    loop
        update public.channels
        set position = (v_item->>'position')::integer
        where id = (v_item->>'id')::uuid;
    end loop;
end;
$$ language plpgsql security definer;

-- Batch update category positions
create or replace function public.update_category_positions(p_positions jsonb)
returns void as $$
declare
    v_item jsonb;
begin
    for v_item in select * from jsonb_array_elements(p_positions)
    loop
        update public.channel_categories
        set position = (v_item->>'position')::integer
        where id = (v_item->>'id')::uuid;
    end loop;
end;
$$ language plpgsql security definer;

-- 16. Server Emojis (Custom emojis uploaded to a server)
create table public.server_emojis (
    id uuid default gen_random_uuid() primary key,
    server_id uuid references public.servers(id) on delete cascade not null,
    name text not null,
    url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.profiles(id) on delete set null
);

alter table public.server_emojis enable row level security;
create policy "Allow select emojis for authenticated" on public.server_emojis for select to authenticated using (true);
create policy "Allow insert emojis for authenticated" on public.server_emojis for insert to authenticated with check (true);
create policy "Allow delete emojis for creators" on public.server_emojis for delete to authenticated using (created_by = auth.uid());

-- 17. Server Sounds (Soundboard items uploaded to a server)
create table public.server_sounds (
    id uuid default gen_random_uuid() primary key,
    server_id uuid references public.servers(id) on delete cascade not null,
    name text not null,
    url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references public.profiles(id) on delete set null
);

alter table public.server_sounds enable row level security;
create policy "Allow select sounds for authenticated" on public.server_sounds for select to authenticated using (true);
create policy "Allow insert sounds for authenticated" on public.server_sounds for insert to authenticated with check (true);
create policy "Allow delete sounds for creators" on public.server_sounds for delete to authenticated using (created_by = auth.uid());

-- 18. User Favorites (Favorite gifs and emojis saved by user)
create table public.user_favorites (
    user_id uuid references public.profiles(id) on delete cascade not null,
    type text check (type in ('gif', 'emoji')) not null,
    content text not null, -- URL dla gifa lub ID/znak dla emotki
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (user_id, type, content)
);

alter table public.user_favorites enable row level security;
create policy "Allow all actions on own favorites" on public.user_favorites for all to authenticated using (user_id = auth.uid());


-- Trigger functions to enforce server emoji and soundboard limits
create or replace function public.check_emoji_limit()
returns trigger as $$
declare
    v_limit integer;
    v_count integer;
begin
    select max_emojis into v_limit from public.servers where id = new.server_id;
    select count(*) into v_count from public.server_emojis where server_id = new.server_id;
    if v_count >= v_limit then
        raise exception 'Limit emotek na tym serwerze został osiągnięty (% sztuk). Wesprzyj serwer, aby zwiększyć limit!', v_limit;
    end if;
    return new;
end;
$$ language plpgsql;

create trigger tr_check_emoji_limit
    before insert on public.server_emojis
    for each row execute procedure public.check_emoji_limit();


create or replace function public.check_sound_limit()
returns trigger as $$
declare
    v_limit integer;
    v_count integer;
begin
    select max_sounds into v_limit from public.servers where id = new.server_id;
    select count(*) into v_count from public.server_sounds where server_id = new.server_id;
    if v_count >= v_limit then
        raise exception 'Limit dźwięków soundboardu na tym serwerze został osiągnięty (% sztuk). Wesprzyj serwer, aby zwiększyć limit!', v_limit;
    end if;
    return new;
end;
$$ language plpgsql;

create trigger tr_check_sound_limit
    before insert on public.server_sounds
    for each row execute procedure public.check_sound_limit();


-- Trigger functions to enforce server channel and category limits
create or replace function public.check_channel_limit()
returns trigger as $$
declare
    v_limit integer;
    v_count integer;
begin
    -- DM or Group DM channel has no server_id and thus no server limits
    if new.server_id is null then
        return new;
    end if;

    select max_channels into v_limit from public.servers where id = new.server_id;
    select count(*) into v_count from public.channels where server_id = new.server_id;
    if v_count >= v_limit then
        raise exception 'Limit kanałów na tym serwerze został osiągnięty (% sztuk). Wesprzyj serwer, aby zwiększyć limit!', v_limit;
    end if;
    return new;
end;
$$ language plpgsql;

create trigger tr_check_channel_limit
    before insert on public.channels
    for each row execute procedure public.check_channel_limit();


create or replace function public.check_category_limit()
returns trigger as $$
declare
    v_limit integer;
    v_count integer;
begin
    select max_categories into v_limit from public.servers where id = new.server_id;
    select count(*) into v_count from public.channel_categories where server_id = new.server_id;
    if v_count >= v_limit then
        raise exception 'Limit kategorii na tym serwerze został osiągnięty (% sztuk). Wesprzyj serwer, aby zwiększyć limit!', v_limit;
    end if;
    return new;
end;
$$ language plpgsql;

create trigger tr_check_category_limit
    before insert on public.channel_categories
    for each row execute procedure public.check_category_limit();



-- 19. Supabase Storage Buckets and Security Policies
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('emojis', 'emojis', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('soundboard', 'soundboard', true)
on conflict (id) do nothing;

-- Policies for attachments bucket (max 50MB)
create policy "Allow read attachments for all" on storage.objects for select to authenticated using (bucket_id = 'attachments');
create policy "Allow insert attachments max 50MB" on storage.objects for insert to authenticated with check (
    bucket_id = 'attachments' and 
    (metadata->>'size')::int <= 52428800
);

-- Policies for emojis bucket (max 1MB, images/webp/gifs only)
create policy "Allow read emojis for all" on storage.objects for select to authenticated using (bucket_id = 'emojis');
create policy "Allow insert emojis max 1MB images" on storage.objects for insert to authenticated with check (
    bucket_id = 'emojis' and 
    (metadata->>'size')::int <= 1048576 and
    metadata->>'mimetype' ~ 'image/.*'
);

-- Policies for soundboard bucket (max 2MB, audio only)
create policy "Allow read soundboard for all" on storage.objects for select to authenticated using (bucket_id = 'soundboard');
create policy "Allow insert soundboard max 2MB audio" on storage.objects for insert to authenticated with check (
    bucket_id = 'soundboard' and 
    (metadata->>'size')::int <= 2097152 and
    metadata->>'mimetype' ~ 'audio/.*'
);








