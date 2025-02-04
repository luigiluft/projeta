export interface Project {
  id: string;
  name: string;
  attributes: Record<string, string | number>;
}

export interface Attribute {
  id: string;
  name: string;
  unit: "hours" | "quantity" | "percentage";
  type: "number" | "list" | "text";
  defaultValue?: string;
}

export interface ProjectFormProps {
  editingId: string | null;
  attributes: Attribute[];
  onSubmit: (values: Project) => void;
  initialValues?: Project;
}