
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { importFromCSV } from '@/utils/csvImport';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

interface TaskImporterProps {
  onSuccess: () => void;
}

export function TaskImporter({ onSuccess }: TaskImporterProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setError(null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError("Por favor, selecione um arquivo CSV para importar");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await importFromCSV(selectedFile);
      
      // Map the imported data to match the database schema
      const tasks = data.map(row => {
        // Verificar se existe o campo task_name (já garantido pelo importFromCSV)
        if (!row['task_name']) {
          throw new Error('Campo "task_name" é obrigatório');
        }

        // Convert display names back to database field names
        const task = {
          task_name: row['task_name'] || '',
          phase: row['Fase'] || row['fase'] || row['phase'] || '',
          epic: row['Epic'] || row['epic'] || '',
          story: row['Story'] || row['story'] || '',
          owner: row['Responsável'] || row['responsavel'] || row['owner'] || '',
          is_active: row['Ativo'] === true || row['Ativo'] === 'Sim' || row['is_active'] === true || true,
          status: convertStatus(row['Status'] || row['status'] || 'pending'),
          hours_type: determineHoursType(row),
          fixed_hours: null as number | null,
          hours_formula: null as string | null
        };

        // Handle fixed_hours if present
        if (row['Horas Fixas'] || row['horas_fixas'] || row['fixed_hours']) {
          const hoursValue = row['Horas Fixas'] || row['horas_fixas'] || row['fixed_hours'];
          const hours = parseFloat(String(hoursValue));
          if (!isNaN(hours)) {
            task.fixed_hours = hours;
          }
        }

        // Handle hours_formula if present
        if (row['Fórmula de Horas'] || row['formula_horas'] || row['hours_formula']) {
          task.hours_formula = row['Fórmula de Horas'] || row['formula_horas'] || row['hours_formula'];
          task.hours_type = 'formula';
        }

        return task;
      });

      if (tasks.length === 0) {
        setError('Nenhuma tarefa encontrada no arquivo');
        return;
      }

      console.log('Tarefas a serem importadas:', tasks);

      // Insert tasks into the database
      const { error: supabaseError } = await supabase.from('tasks').insert(tasks);

      if (supabaseError) {
        console.error('Erro ao importar tarefas:', supabaseError);
        setError(`Erro ao importar tarefas: ${supabaseError.message}`);
      } else {
        toast.success(`${tasks.length} tarefas importadas com sucesso!`);
        onSuccess();
        setOpen(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setError(`${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine hours_type based on available data
  const determineHoursType = (row: Record<string, any>): string => {
    if (row['Fórmula de Horas'] || row['formula_horas'] || row['hours_formula']) {
      return 'formula';
    } else if (row['Horas Fixas'] || row['horas_fixas'] || row['fixed_hours']) {
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
    setError(null);
  };

  const handleSelectFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

      <Dialog open={open} onOpenChange={(openState) => {
        setOpen(openState);
        if (!openState) resetForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importar Tarefas</DialogTitle>
            <DialogDescription>
              Selecione um arquivo CSV para importar tarefas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertTitle>Formato esperado</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                O arquivo deve conter uma coluna chamada <strong>"Tarefa"</strong> (obrigatória) e pode conter colunas como: 
                Fase, Epic, Story, Responsável, Status, Horas Fixas, Fórmula de Horas.
              </AlertDescription>
            </Alert>
            
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-3">
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
                  {selectedFile ? selectedFile.name : 'Selecionar arquivo CSV'}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={loading || !selectedFile}
              className="ml-2"
            >
              {loading ? 'Processando...' : 'Importar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
