import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Filter, Download, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { exportToCSV } from "@/utils/csvExport";

interface ProjectHeaderProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onTasksSelected: (taskIds: string[]) => void;
}

export function ProjectHeader({ open, setOpen, onTasksSelected }: ProjectHeaderProps) {
  const navigate = useNavigate();

  const handleExportCSV = () => {
    const data = [
      { id: 1, name: "Project 1", status: "In Progress" },
      { id: 2, name: "Project 2", status: "Completed" },
    ];
    exportToCSV(data, "projects");
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Projetos</h1>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtrar
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Projeto
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-800 shadow-md border border-gray-200 dark:border-gray-700 z-50">
            <DropdownMenuItem onClick={() => navigate("/projects/new")} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Projeto
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpen(true)} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Importar Planilha
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Importar Projetos</DialogTitle>
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
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Importar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
