
import { useState } from "react";
import { View } from "@/types/project";
import { toast } from "sonner";

export const useProjectViews = () => {
  const [savedViews, setSavedViews] = useState<View[]>([]);

  // Função para salvar uma nova visualização
  const handleSaveView = () => {
    if (savedViews.length >= 5) {
      toast.error("Limite máximo de 5 visualizações atingido");
      return;
    }
    
    const newView: View = {
      id: crypto.randomUUID(),
      name: `Visualização ${savedViews.length + 1}`,
      columns: [],
    };
    
    setSavedViews([...savedViews, newView]);
    toast.success("Visualização salva com sucesso");
  };

  return {
    savedViews,
    handleSaveView
  };
};
