import { useEffect, useState } from "react";
import { useAuthStore } from "./stores/authStore";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { MainLayout } from "./components/layout/MainLayout";
import { Loader2 } from "lucide-react";

function App() {
  const { user, loading, initialized, initialize } = useAuthStore();
  const [isRegistering, setIsRegistering] = useState(false);

  // Initialize Auth state
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    const initAuth = async () => {
      unsubscribe = await initialize();
    };
    initAuth();
    return () => unsubscribe();
  }, []);

  if (!initialized || (loading && !user)) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-950 text-zinc-400">
        <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
        <p className="text-sm font-medium tracking-wide">Inicjalizowanie Rcord...</p>
      </div>
    );
  }

  if (!user) {
    if (isRegistering) {
      return <Register onNavigateToLogin={() => setIsRegistering(false)} />;
    }
    return <Login onNavigateToRegister={() => setIsRegistering(true)} />;
  }

  // Logged in layout
  return <MainLayout />;
}

export default App;
