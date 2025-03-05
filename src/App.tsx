import { Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import NewProject from './pages/NewProject';
import TaskManagement from './pages/TaskManagement';
import TaskDetails from './pages/TaskDetails';
import NewTask from './pages/NewTask';
import BulkTaskCreation from './pages/BulkTaskCreation';
import Team from './pages/Team';
import NewTeamMember from './pages/NewTeamMember';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';
import RoleManagement from './pages/RoleManagement';
import UserApproval from './pages/UserApproval';
import RolePermissions from './pages/RolePermissions';
import Import from './pages/Import';
import ProjectAttributes from './pages/ProjectAttributes';
import NewAttribute from './pages/NewAttribute';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Toaster closeButton richColors />
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
            <Route path="task-management" element={<TaskManagement />} />
            <Route path="task-management/:id" element={<TaskDetails />} />
            <Route path="task-management/new" element={<NewTask />} />
            <Route path="task-management/bulk-import" element={<BulkTaskCreation />} />
            <Route path="team" element={<Team />} />
            <Route path="team/new" element={<NewTeamMember />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="settings" element={<Settings />} />
            <Route path="role-management" element={<RoleManagement />} />
            <Route path="user-approval" element={<UserApproval />} />
            <Route path="role-permissions" element={<RolePermissions />} />
            <Route path="import" element={<Import />} />
            <Route path="project-attributes" element={<ProjectAttributes />} />
            <Route path="project-attributes/new" element={<NewAttribute />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
