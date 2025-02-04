import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { toast } from "sonner";

export const useProjectForm = (id: string | undefined) => {
  const [project, setProject] = useState<Project | undefined>(undefined);

  useEffect(() => {
    if (id) {
      const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
      const foundProject = storedProjects.find((p: Project) => p.id === id);
      if (foundProject) {
        setProject(foundProject);
      }
    }
  }, [id]);

  const handleSubmit = (values: Project) => {
    const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    
    if (id) {
      const updatedProjects = storedProjects.map((p: Project) =>
        p.id === id ? values : p
      );
      localStorage.setItem("projects", JSON.stringify(updatedProjects));
      toast.success("Projeto atualizado com sucesso!");
    } else {
      localStorage.setItem(
        "projects",
        JSON.stringify([...storedProjects, values])
      );
      toast.success("Projeto criado com sucesso!");
    }
  };

  return {
    project,
    handleSubmit,
  };
};