
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectAttributes from "./pages/ProjectAttributes";
import Team from "./pages/Team";
import TaskManagement from "./pages/TaskManagement";
import TaskDetails from "./pages/TaskDetails";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Import from "./pages/Import";
import NewProject from "./pages/NewProject";
import NewAttribute from "./pages/NewAttribute";
import NewTeamMember from "./pages/NewTeamMember";
import NewTask from "./pages/NewTask";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import RoleManagement from "./pages/RoleManagement";
import RolePermissions from "./pages/RolePermissions";
import UserApproval from "./pages/UserApproval";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/new" element={<NewProject />} />
              <Route path="/project-attributes" element={<ProjectAttributes />} />
              <Route path="/project-attributes/new" element={<NewAttribute />} />
              <Route path="/team" element={<Team />} />
              <Route path="/team/new" element={<NewTeamMember />} />
              <Route path="/task-management" element={<TaskManagement />} />
              <Route path="/task-management/:taskId" element={<TaskDetails />} />
              <Route path="/task-management/new" element={<NewTask />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/import" element={<Import />} />
              <Route path="/settings/roles" element={<RoleManagement />} />
              <Route path="/settings/roles/:id" element={<RolePermissions />} />
              <Route path="/settings/user-approval" element={<UserApproval />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
