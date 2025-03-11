
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";
import { TeamList, TeamMember } from "@/components/Team/TeamList";
import { Column, View } from "@/types/project";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TaskImporter } from "@/components/TaskManagement/TaskImporter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Team() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedViews, setSavedViews] = useState<View[]>([]);
  const navigate = useNavigate();
  const [columns, setColumns] = useState<Column[]>([
    { id: "name", label: "Nome", visible: true },
    { id: "position", label: "Cargo", visible: true },
    { id: "email", label: "Email", visible: true },
    { id: "department", label: "Departamento", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "hourly_rate", label: "Valor/Hora", visible: true },
    { id: "daily_capacity", label: "Capacidade Diária", visible: true },
    { id: "actions", label: "Ações", visible: true },
  ]);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) {
        throw error;
      }

      setTeamMembers(data || []);
    } catch (error) {
      console.error('Erro ao carregar membros da equipe:', error);
      toast.error('Falha ao carregar membros da equipe');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Membro da equipe removido com sucesso');
      setTeamMembers(teamMembers.filter(member => member.id !== id));
    } catch (error) {
      console.error('Erro ao excluir membro da equipe:', error);
      toast.error('Erro ao excluir membro da equipe');
    }
  };

  const handleColumnVisibilityChange = (columnId: string) => {
    setColumns(prevColumns => {
      const updatedColumns = prevColumns.map(col => 
        col.id === columnId ? { ...col, visible: !col.visible } : col
      );
      
      // Always keep the "actions" column visible
      const actionsColumn = updatedColumns.find(col => col.id === "actions");
      if (actionsColumn && !actionsColumn.visible) {
        actionsColumn.visible = true;
      }
      
      console.log("Column visibility changed for:", columnId, "New state:", updatedColumns.find(c => c.id === columnId)?.visible);
      return updatedColumns;
    });
  };

  const handleSaveView = () => {
    if (savedViews.length >= 5) {
      toast.error("Limite máximo de 5 visualizações atingido");
      return;
    }
    
    const newView: View = {
      id: crypto.randomUUID(),
      name: `Visualização ${savedViews.length + 1}`,
      columns: [...columns],
    };
    
    setSavedViews(prev => [...prev, newView]);
    toast.success("Visualização salva com sucesso");
  };

  const handleLoadView = (view: View) => {
    setColumns(prev => 
      prev.map(col => {
        const viewCol = view.columns.find(vc => vc.id === col.id);
        return viewCol ? { ...col, visible: viewCol.visible } : col;
      })
    );
    toast.success(`Visualização "${view.name}" carregada`);
  };

  const handleColumnsChange = (newColumns: Column[]) => {
    setColumns(newColumns);
  };

  const handleImportCSV = async () => {
    // Implementar importação de CSV quando necessário
    console.log("Importação de CSV para membros da equipe");
  };

  const handleNewMember = () => {
    navigate('/team/new');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Equipe</h1>
        <div className="flex items-center gap-2">
          <ActionButtons
            columns={columns}
            savedViews={savedViews}
            onColumnVisibilityChange={handleColumnVisibilityChange}
            onSaveView={handleSaveView}
            onLoadView={handleLoadView}
            data={teamMembers}
            exportFilename="equipe"
            isLoading={loading}
            showAddButton={false}
          />
          <TaskImporter 
            onSuccess={fetchTeamMembers} 
            buttonLabel="Importar CSV" 
          />
          <Button 
            className="flex items-center gap-2"
            onClick={handleNewMember}
          >
            <Plus className="h-4 w-4" />
            Novo Membro
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <Card className="bg-white dark:bg-slate-800 shadow-md">
          <TeamList 
            teamMembers={teamMembers} 
            columns={columns}
            onColumnsChange={handleColumnsChange}
            onDelete={handleDeleteTeamMember}
          />
        </Card>
      )}
    </div>
  );
}
