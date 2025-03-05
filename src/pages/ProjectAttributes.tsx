
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AttributeForm } from "@/components/ProjectAttributes/AttributeForm";
import { AttributeList } from "@/components/ProjectAttributes/AttributeList";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";
import { Column, View } from "@/types/project";
import { ProjectAttribute } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";

export default function ProjectAttributes() {
  const [attributes, setAttributes] = useState<ProjectAttribute[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState<Column[]>([
    { id: "name", label: "Nome", visible: true },
    { id: "code", label: "Código", visible: true },
    { id: "value", label: "Valor", visible: true },
    { id: "unit", label: "Unidade", visible: true },
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
            value: values.value,
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
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleSaveView = () => {
    if (savedViews.length >= 5) {
      toast.error("Limite máximo de 5 visualizações atingido");
      return;
    }
    const newView: View = {
      id: crypto.randomUUID(),
      name: `Visualização ${savedViews.length + 1}`,
      columns: columns.filter(col => col.visible),
    };
    setSavedViews([...savedViews, newView]);
    toast.success("Visualização salva com sucesso");
  };

  const handleLoadView = (view: View) => {
    setColumns(columns.map(col => ({
      ...col,
      visible: view.columns.some(viewCol => viewCol.id === col.id),
    })));
  };

  const handleImportSpreadsheet = () => {
    // Implement spreadsheet import logic here
    console.log("Import spreadsheet clicked");
  };

  const handleColumnsChange = (newColumns: Column[]) => {
    setColumns(newColumns);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Atributos do Projeto</h1>
        <ActionButtons
          columns={columns}
          savedViews={savedViews}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          onSaveView={handleSaveView}
          onLoadView={handleLoadView}
          onImportSpreadsheet={handleImportSpreadsheet}
          newButtonText="Novo Atributo"
          data={attributes}
          exportFilename="atributos-projeto"
        />
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
    </div>
  );
}
