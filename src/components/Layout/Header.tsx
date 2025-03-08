
import { LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { NotificationsMenu } from "./NotificationsMenu";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";

export function Header() {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Até logo!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-4">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-semibold text-primary hover:opacity-80 transition-opacity">
          Project Management
        </Link>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <NotificationsMenu />
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
