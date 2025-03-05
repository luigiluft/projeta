
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectAttribute } from "@/types/database";

interface AttributeFormProps {
  editingId: string | null;
  onSubmit: (values: Omit<ProjectAttribute, 'id' | 'created_at'>) => void;
  initialValues?: ProjectAttribute;
}

export function AttributeForm({ editingId, onSubmit, initialValues }: AttributeFormProps) {
  const [values, setValues] = useState({
    name: initialValues?.name || "",
    code: initialValues?.code || "",
    value: initialValues?.value || "",
    unit: initialValues?.unit || "",
    description: initialValues?.description || "",
    default_value: initialValues?.default_value || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  // Função para gerar código a partir do nome
  const generateCode = (name: string) => {
    return name
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/[^A-Z0-9_]/g, '');
  };

  // Atualizar o código quando o nome mudar, se o código não tiver sido editado manualmente
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setValues({
      ...values,
      name: newName,
      code: generateCode(newName)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={values.name}
          onChange={handleNameChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Código</Label>
        <Input
          id="code"
          value={values.code}
          onChange={(e) => setValues({ ...values, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })}
          required
          placeholder="CÓDIGO_DO_ATRIBUTO"
          className="uppercase"
        />
        <p className="text-xs text-gray-500">Somente letras maiúsculas, números e underscore (_)</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="value">Valor</Label>
        <Input
          id="value"
          value={values.value}
          onChange={(e) => setValues({ ...values, value: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unidade</Label>
        <Select
          value={values.unit}
          onValueChange={(value) => setValues({ ...values, unit: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma unidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hours">Horas</SelectItem>
            <SelectItem value="quantity">Quantidade</SelectItem>
            <SelectItem value="percentage">Porcentagem</SelectItem>
            <SelectItem value="currency">Moeda</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="default_value">Valor Padrão</Label>
        <Input
          id="default_value"
          value={values.default_value}
          onChange={(e) => setValues({ ...values, default_value: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="submit">
          {editingId ? "Atualizar" : "Criar"} Atributo
        </Button>
      </div>
    </form>
  );
}
