
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { importFromCSV } from '@/utils/csvImport';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Upload } from 'lucide-react';

interface TaskImporterProps {
  onSuccess: () => void;
}

export function TaskImporter({ onSuccess }: TaskImporterProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const data = await importFromCSV(file);
      
      // Map the imported data to match the database schema
      const tasks = data.map(row => {
        // Verificar se existe o campo Tarefa e converter para task_name
        if (!row['Tarefa'] && !row['task_name']) {
          throw new Error('Campo "Tarefa" é obrigatório no arquivo CSV');
        }

        // Convert display names back to database field names
        const task = {
          task_name: row['Tarefa'] || row['task_name'] || '',
          phase: row['Fase'] || row['phase'] || '',
          epic: row['Epic'] || row['epic'] || '',
          story: row['Story'] || row['story'] || '',
          owner: row['Responsável'] || row['owner'] || '',
          is_active: row['Ativo'] === true || row['Ativo'] === 'Sim' || row['is_active'] === true || true,
          status: convertStatus(row['Status'] || row['status'] || 'pending'),
          hours_type: determineHoursType(row),
          fixed_hours: null as number | null,
          hours_formula: null as string | null
        };

        // Handle fixed_hours if present
        if (row['Horas Fixas'] || row['fixed_hours']) {
          const hoursValue = row['Horas Fixas'] || row['fixed_hours'];
          const hours = parseFloat(String(hoursValue));
          if (!isNaN(hours)) {
            task.fixed_hours = hours;
          }
        }

        // Handle hours_formula if present
        if (row['Fórmula de Horas'] || row['hours_formula']) {
          task.hours_formula = row['Fórmula de Horas'] || row['hours_formula'];
          task.hours_type = 'formula';
        }

        return task;
      });

      if (tasks.length === 0) {
        toast.error('Nenhuma tarefa encontrada no arquivo');
        return;
      }

      console.log('Tarefas a serem importadas:', tasks);

      // Insert tasks into the database
      const { error } = await supabase.from('tasks').insert(tasks);

      if (error) {
        console.error('Erro ao importar tarefas:', error);
        toast.error(`Erro ao importar tarefas: ${error.message}`);
      } else {
        toast.success(`${tasks.length} tarefas importadas com sucesso!`);
        onSuccess();
        setOpen(false);
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error(`Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Helper function to determine hours_type based on available data
  const determineHoursType = (row: Record<string, any>): string => {
    if (row['Fórmula de Horas'] || row['hours_formula']) {
      return 'formula';
    } else if (row['Horas Fixas'] || row['fixed_hours']) {
      return 'fixed';
    }
    // Default to 'fixed' if no hours information is provided
    return 'fixed';
  };

  const convertStatus = (status: string): string => {
    status = (status || '').toLowerCase();
    if (status.includes('progre') || status.includes('andamento')) {
      return 'in_progress';
    } else if (status.includes('conclu') || status.includes('complet')) {
      return 'completed';
    }
    return 'pending';
  };

  const handleImportClick = () => {
    setOpen(true);
  };

  const handleSelectFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <div 
        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer bg-primary/10 hover:bg-primary/20 rounded-sm" 
        onClick={handleImportClick}
      >
        <Upload className="mr-2 h-4 w-4" />
        Importar Planilha
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importar Tarefas</DialogTitle>
            <DialogDescription>
              Selecione um arquivo CSV para importar tarefas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                O arquivo deve conter colunas com os nomes: 
                Tarefa, Fase, Epic, Story, Responsável, Status, Horas Fixas, Fórmula de Horas.
              </p>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <input
                  type="file"
                  id="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <Button 
                  onClick={handleSelectFileClick} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Processando...' : 'Selecionar arquivo CSV'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
