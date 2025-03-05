
import { Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from '@/components/AuthProvider';
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
      <ThemeProvider defaultTheme="system">
        <Toaster closeButton richColors />
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="/dashboard/projects" element={<Projects />} />
              <Route path="/dashboard/projects/new" element={<NewProject />} />
              <Route path="/dashboard/task-management" element={<TaskManagement />} />
              <Route path="/dashboard/task-management/:id" element={<TaskDetails />} />
              <Route path="/dashboard/task-management/new" element={<NewTask />} />
              <Route path="/dashboard/task-management/bulk-import" element={<BulkTaskCreation />} />
              <Route path="/dashboard/team" element={<Team />} />
              <Route path="/dashboard/team/new" element={<NewTeamMember />} />
              <Route path="/dashboard/calendar" element={<Calendar />} />
              <Route path="/dashboard/settings" element={<Settings />} />
              <Route path="/dashboard/role-management" element={<RoleManagement />} />
              <Route path="/dashboard/user-approval" element={<UserApproval />} />
              <Route path="/dashboard/role-permissions" element={<RolePermissions />} />
              <Route path="/dashboard/import" element={<Import />} />
              <Route path="/dashboard/project-attributes" element={<ProjectAttributes />} />
              <Route path="/dashboard/project-attributes/new" element={<NewAttribute />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
