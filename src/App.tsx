import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import ProjectAttributes from "@/pages/ProjectAttributes";
import TaskManagement from "@/pages/TaskManagement";
import Team from "@/pages/Team";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="project-attributes" element={<ProjectAttributes />} />
          <Route path="task-management" element={<TaskManagement />} />
          <Route path="team" element={<Team />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;