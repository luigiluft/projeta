
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TeamForm } from "@/components/Team/TeamForm";
import { TeamMember } from "@/components/Team/TeamList";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function EditTeamMember() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<TeamMember | undefined>(undefined);

  useEffect(() => {
    if (id) {
      fetchTeamMember(id);
    }
  }, [id]);

  const fetchTeamMember = async (memberId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setMember(data as TeamMember);
      } else {
        toast.error("Membro não encontrado");
        navigate("/team");
      }
    } catch (error) {
      console.error('Erro ao carregar membro da equipe:', error);
      toast.error('Falha ao carregar dados do membro');
      navigate("/team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/team")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Editar Membro</h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : member ? (
        <TeamForm initialValues={member} onClose={() => navigate("/team")} />
      ) : (
        <p>Membro não encontrado</p>
      )}
    </div>
  );
}
