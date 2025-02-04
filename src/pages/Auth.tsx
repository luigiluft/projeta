import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    supervisorEmail: "",
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAuthError = (error: any) => {
    console.error("Auth error details:", error);
    let errorMessage = "Ocorreu um erro inesperado";
    
    if (error.message?.includes("Invalid login credentials")) {
      errorMessage = "Email ou senha incorretos. Por favor, verifique suas credenciais.";
    } else if (error.message?.includes("Email not confirmed")) {
      errorMessage = "Por favor, confirme seu email antes de fazer login";
    } else if (error.message?.includes("Password should be")) {
      errorMessage = "A senha deve ter pelo menos 6 caracteres";
    } else if (error.message?.includes("User already registered")) {
      errorMessage = "Este email já está cadastrado";
    } else if (error.message?.includes("Invalid email")) {
      errorMessage = "Por favor, insira um email válido";
    } else {
      errorMessage = error.message || errorMessage;
    }

    toast({
      title: "Erro",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(loginData.email)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email.trim().toLowerCase(),
        password: loginData.password,
      });

      if (error) throw error;

      navigate("/");
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Starting signup process...");
    
    if (!signupData.email || !signupData.password || !signupData.firstName || 
        !signupData.lastName || !signupData.supervisorEmail) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(signupData.email) || !validateEmail(signupData.supervisorEmail)) {
      toast({
        title: "Erro",
        description: "Por favor, insira emails válidos",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First, ensure there's no existing session
      await supabase.auth.signOut();
      
      console.log("Attempting to sign up user with data:", {
        email: signupData.email,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        supervisorEmail: signupData.supervisorEmail
      });

      const { data, error } = await supabase.auth.signUp({
        email: signupData.email.trim().toLowerCase(),
        password: signupData.password,
        options: {
          data: {
            first_name: signupData.firstName.trim(),
            last_name: signupData.lastName.trim(),
            supervisor_email: signupData.supervisorEmail.trim().toLowerCase(),
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        throw error;
      }

      if (!data.user) {
        throw new Error("No user data returned from signup");
      }

      // Insert into user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([
          {
            user_id: data.user.id,
            role: 'user',
            supervisor_email: signupData.supervisorEmail.trim().toLowerCase(),
            approved: false
          }
        ]);

      if (roleError) {
        console.error("Error creating user role:", roleError);
        throw roleError;
      }

      console.log("Signup successful:", data);

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Seu cadastro será analisado e aprovado pelo seu supervisor. Você receberá um email quando estiver pronto para acessar.",
      });
      
      setSignupData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        supervisorEmail: "",
      });
    } catch (error: any) {
      console.error("Error in signup process:", error);
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Projeta</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Senha"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Input
                    placeholder="Nome"
                    value={signupData.firstName}
                    onChange={(e) =>
                      setSignupData({ ...signupData, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Input
                    placeholder="Sobrenome"
                    value={signupData.lastName}
                    onChange={(e) =>
                      setSignupData({ ...signupData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Email do Supervisor"
                    value={signupData.supervisorEmail}
                    onChange={(e) =>
                      setSignupData({ ...signupData, supervisorEmail: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Senha"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}