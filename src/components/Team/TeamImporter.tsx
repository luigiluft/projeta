
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { importFromCSV } from '@/utils/csvImport';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TeamImporterProps {
  onSuccess: () => void;
  buttonLabel?: string;
}

type ImportMode = 'add_update' | 'replace';

export function TeamImporter({ onSuccess, buttonLabel = "Importar CSV" }: TeamImporterProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>('add_update');
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
      
      if (data.length === 0) {
        throw new Error('Nenhum membro da equipe encontrado no arquivo');
      }
      
      console.log('Membros da equipe a serem importados:', data);
      
      const teamMembers = data.map(row => {
        // Verificar se o membro tem pelo menos nome e sobrenome
        if (!row['first_name'] && !row['Nome'] && !row['nome']) {
          throw new Error('Campo de nome é obrigatório');
        }

        // Mapeamento de campos com diferentes possíveis nomes
        const member = {
          first_name: row['Nome'] || row['nome'] || row['first_name'] || row['nome_proprio'] || '',
          last_name: row['Sobrenome'] || row['sobrenome'] || row['last_name'] || row['ultimo_nome'] || '',
          position: row['Cargo'] || row['cargo'] || row['position'] || row['funcao'] || '',
          email: row['Email'] || row['email'] || row['e-mail'] || '',
          department: row['Departamento'] || row['departamento'] || row['department'] || '',
          squad: row['Squad'] || row['squad'] || row['equipe'] || row['team'] || '',
          status: row['Status'] || row['status'] || 'active',
          hourly_rate: null as number | null,
          daily_capacity: null as number | null
        };

        // Processar valor/hora
        const hourlyRateValue = row['Valor/Hora'] || row['valor_hora'] || row['hourly_rate'] || row['taxa_horaria'];
        if (hourlyRateValue) {
          const hourlyRate = parseFloat(String(hourlyRateValue).replace('R$', '').replace(',', '.').trim());
          if (!isNaN(hourlyRate)) {
            member.hourly_rate = hourlyRate;
          }
        }

        // Processar capacidade diária
        const dailyCapacityValue = row['Capacidade Diária'] || row['capacidade_diaria'] || row['daily_capacity'] || row['horas_dia'];
        if (dailyCapacityValue) {
          const dailyCapacity = parseFloat(String(dailyCapacityValue).replace(',', '.').trim());
          if (!isNaN(dailyCapacity)) {
            member.daily_capacity = dailyCapacity;
          } else {
            member.daily_capacity = 7; // Valor padrão
          }
        } else {
          member.daily_capacity = 7; // Valor padrão
        }

        // Garantir que status seja válido
        if (!['active', 'inactive'].includes(member.status.toLowerCase())) {
          member.status = 'active';
        }

        return member;
      });

      if (importMode === 'replace') {
        const { error: deleteError } = await supabase
          .from('team_members')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (deleteError) {
          console.error('Erro ao excluir membros existentes:', deleteError);
          throw new Error(`Erro ao excluir membros existentes: ${deleteError.message}`);
        }

        const { error: insertError } = await supabase.from('team_members').insert(teamMembers);

        if (insertError) {
          console.error('Erro ao importar membros da equipe:', insertError);
          throw new Error(`Erro ao importar membros da equipe: ${insertError.message}`);
        }

        toast.success(`${teamMembers.length} membros da equipe importados com sucesso (modo substituição)!`);
      } else {
        const { data: existingMembers, error: fetchError } = await supabase
          .from('team_members')
          .select('*');

        if (fetchError) {
          console.error('Erro ao buscar membros existentes:', fetchError);
          throw new Error(`Erro ao buscar membros existentes: ${fetchError.message}`);
        }

        const membersToInsert: typeof teamMembers = [];
        const membersToUpdate: (typeof teamMembers[0] & { id: string })[] = [];

        teamMembers.forEach(importedMember => {
          // Verificar por correspondência via email ou nome completo
          const existingMember = existingMembers?.find(
            em => (em.email && em.email === importedMember.email) || 
                 (em.first_name === importedMember.first_name && em.last_name === importedMember.last_name)
          );

          if (existingMember) {
            membersToUpdate.push({
              ...importedMember,
              id: existingMember.id
            });
          } else {
            membersToInsert.push(importedMember);
          }
        });

        if (membersToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('team_members')
            .insert(membersToInsert);

          if (insertError) {
            console.error('Erro ao inserir novos membros:', insertError);
            throw new Error(`Erro ao inserir novos membros: ${insertError.message}`);
          }
        }

        for (const member of membersToUpdate) {
          const { id, ...updateData } = member;
          const { error: updateError } = await supabase
            .from('team_members')
            .update(updateData)
            .eq('id', id);

          if (updateError) {
            console.error(`Erro ao atualizar membro ${id}:`, updateError);
            throw new Error(`Erro ao atualizar membro: ${updateError.message}`);
          }
        }

        toast.success(`Importação concluída: ${membersToInsert.length} novos membros e ${membersToUpdate.length} membros atualizados!`);
      }

      onSuccess();
      setOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setError(`${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
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
    setImportMode('add_update');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleImportClick}
        className="flex items-center gap-2" 
      >
        <Upload className="h-4 w-4" />
        {buttonLabel}
      </Button>

      <Dialog open={open} onOpenChange={(openState) => {
        setOpen(openState);
        if (!openState) resetForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importar Membros da Equipe</DialogTitle>
            <DialogDescription>
              Selecione um arquivo CSV para importar membros da equipe
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertTitle>Formato esperado</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                O arquivo deve conter colunas como: Nome, Sobrenome, Cargo, Email, Departamento, 
                Valor/Hora, Capacidade Diária, Status.
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

            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="importMode">Modo de importação</Label>
                <Select value={importMode} onValueChange={(value) => setImportMode(value as ImportMode)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um modo de importação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add_update">Adicionar e atualizar membros</SelectItem>
                    <SelectItem value="replace">Substituir todos os membros existentes</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {importMode === 'add_update' 
                    ? 'Novos membros serão adicionados e membros existentes serão atualizados se tiverem o mesmo email ou nome completo.' 
                    : 'ATENÇÃO: Todos os membros existentes serão excluídos e substituídos pelos novos.'}
                </p>
              </div>

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
