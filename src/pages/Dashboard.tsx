import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Dashboard() {
  const { data: projectStats = [] } = useQuery({
    queryKey: ['project-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('deleted', false);

      if (error) {
        toast.error('Erro ao carregar estatísticas dos projetos');
        throw error;
      }

      return data;
    },
  });

  return (
    <div>
      <h1>Dashboard</h1>
      {projectStats.map((project) => (
        <div key={project.id}>
          <h2>{project.name}</h2>
          <p>Status: {project.status}</p>
        </div>
      ))}
    </div>
  );
}
