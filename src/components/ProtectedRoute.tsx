import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />;
}