
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    // Redirecionando para a raiz, onde agora está o Auth
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
