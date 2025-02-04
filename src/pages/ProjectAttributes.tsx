import { useState } from "react";
import { toast } from "sonner";
import { AttributeForm } from "@/components/ProjectAttributes/AttributeForm";
import { AttributeList } from "@/components/ProjectAttributes/AttributeList";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";

interface Attribute {
  id: string;
  name: string;
  unit: "hours" | "quantity" | "percentage";
  type: "number" | "list" | "text";
  defaultValue?: string;
}

interface Column {
  id: string;
  label: string;
  visible: boolean;
}

interface View {
  id: string;
  name: string;
  columns: string[];
}

export default function ProjectAttributes() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [columns, setColumns] = useState<Column[]>([
    { id: "name", label: "Nome", visible: true },
    { id: "unit", label: "Unidade", visible: true },
    { id: "type", label: "Tipo", visible: true },
    { id: "defaultValue", label: "Valor Padrão", visible: true },
  ]);
  const [savedViews, setSavedViews] = useState<View[]>([]);

  const handleSubmit = (values: Omit<Attribute, "id">) => {
    if (editingId) {
      setAttributes(attributes.map(attr => 
        attr.id === editingId ? { ...values, id: editingId } : attr
      ));
      setEditingId(null);
      toast.success("Atributo atualizado com sucesso!");
    } else {
      const newAttribute: Attribute = {
        ...values,
        id: Math.random().toString(36).substr(2, 9),
      };
      setAttributes([...attributes, newAttribute]);
      toast.success("Atributo criado com sucesso!");
    }
    setShowForm(false);
  };

  const handleEdit = (attribute: Attribute) => {
    setEditingId(attribute.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setAttributes(attributes.filter(attr => attr.id !== id));
    toast.success("Atributo removido com sucesso!");
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
    const newView = {
      id: crypto.randomUUID(),
      name: `Visualização ${savedViews.length + 1}`,
      columns: columns.filter(col => col.visible).map(col => col.id),
    };
    setSavedViews([...savedViews, newView]);
    toast.success("Visualização salva com sucesso");
  };

  const handleLoadView = (view: View) => {
    setColumns(columns.map(col => ({
      ...col,
      visible: view.columns.includes(col.id),
    })));
  };

  const handleImportSpreadsheet = () => {
    // Implement spreadsheet import logic here
    console.log("Import spreadsheet clicked");
  };

  const handleNewAttribute = () => {
    setEditingId(null);
    setShowForm(true);
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
          onNewAttribute={handleNewAttribute}
          onImportSpreadsheet={handleImportSpreadsheet}
          newButtonText="Novo Atributo"
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
      />
    </div>
  );
}
