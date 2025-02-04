import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import ProjectAttributes from "@/pages/ProjectAttributes";
import TaskManagement from "@/pages/TaskManagement";
import Team from "@/pages/Team";
import Projects from "@/pages/Projects";
import Calendar from "@/pages/Calendar";
import NewProject from "@/pages/NewProject";
import NewTeamMember from "@/pages/NewTeamMember";
import NewTask from "@/pages/NewTask";
import NewAttribute from "@/pages/NewAttribute";
import Settings from "@/pages/Settings";
import Auth from "@/pages/Auth";
import UserApproval from "@/pages/UserApproval";
import RoleManagement from "@/pages/RoleManagement";
import RolePermissions from "@/pages/RolePermissions";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/new" element={<NewProject />} />
              <Route path="project-attributes" element={<ProjectAttributes />} />
              <Route path="project-attributes/new" element={<NewAttribute />} />
              <Route path="task-management" element={<TaskManagement />} />
              <Route path="task-management/new" element={<NewTask />} />
              <Route path="team" element={<Team />} />
              <Route path="team/new" element={<NewTeamMember />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/user-approval" element={<UserApproval />} />
              <Route path="settings/roles" element={<RoleManagement />} />
              <Route path="settings/roles/:role" element={<RolePermissions />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;