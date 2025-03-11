
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AttributeForm } from "@/components/ProjectAttributes/AttributeForm";
import { AttributeList } from "@/components/ProjectAttributes/AttributeList";
import { Column, View } from "@/types/project";
import { ProjectAttribute } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Plus, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ColumnManager } from "@/components/ProjectAttributes/ColumnManager";
import { ViewManager } from "@/components/ProjectAttributes/ViewManager";
import { exportToCSV } from "@/utils/csvExport";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function ProjectAttributes() {
  const [attributes, setAttributes] = useState<ProjectAttribute[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [columns, setColumns] = useState<Column[]>([
    { id: "name", label: "Nome", visible: true },
    { id: "code", label: "Código", visible: true },
    { id: "unit", label: "Unidade", visible: true },
    { id: "default_value", label: "Valor Padrão", visible: true },
  ]);
  const [savedViews, setSavedViews] = useState<View[]>([]);

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      const { data, error } = await supabase
        .from('project_attributes')
        .select('*');

      if (error) {
        throw error;
      }

      setAttributes(data || []);
    } catch (error) {
      console.error('Error fetching attributes:', error);
      toast.error('Erro ao carregar atributos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: Omit<ProjectAttribute, 'id' | 'created_at'>) => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from('project_attributes')
          .update({
            name: values.name,
            code: values.code,
            unit: values.unit,
            description: values.description,
            default_value: values.default_value
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success("Atributo atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from('project_attributes')
          .insert([values]);

        if (error) throw error;
        toast.success("Atributo criado com sucesso!");
      }

      setEditingId(null);
      setShowForm(false);
      fetchAttributes();
    } catch (error) {
      console.error('Error saving attribute:', error);
      toast.error('Erro ao salvar atributo');
    }
  };

  const handleEdit = (attribute: ProjectAttribute) => {
    setEditingId(attribute.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_attributes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAttributes(attributes.filter(attr => attr.id !== id));
      toast.success("Atributo removido com sucesso!");
    } catch (error) {
      console.error('Error deleting attribute:', error);
      toast.error('Erro ao remover atributo');
    }
  };

  const handleColumnVisibilityChange = (columnId: string) => {
    setColumns(prevColumns => {
      const updatedColumns = prevColumns.map(col => 
        col.id === columnId ? { ...col, visible: !col.visible } : col
      );
      
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
    setSavedViews([...savedViews, newView]);
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

  const handleExportCSV = () => {
    exportToCSV(attributes, "atributos-projeto");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Atributos do Projeto</h1>
        <div className="flex items-center gap-2">
          <ColumnManager
            columns={columns}
            onColumnVisibilityChange={handleColumnVisibilityChange}
          />
          <ViewManager
            onSaveView={handleSaveView}
            onLoadView={handleLoadView}
            savedViews={savedViews}
          />
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importar CSV
          </Button>
          <Button onClick={() => navigate('/project-attributes/new')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Atributo
          </Button>
        </div>
      </div>

      {showForm && (
        <AttributeForm
          editingId={editingId}
          onSubmit={handleSubmit}
          initialValues={attributes.find(attr => attr.id === editingId)}
        />
      )}

      <AttributeList
        attributes={attributes}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onColumnsChange={handleColumnsChange}
      />

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Importar Atributos</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">Arquivo CSV ou Excel</Label>
              <Input id="file" type="file" accept=".csv,.xlsx,.xls" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" placeholder="Adicione informações sobre os dados importados" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="headers" />
              <Label htmlFor="headers">A primeira linha contém cabeçalhos</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Importar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
