import { Button } from "@/components/ui/button";
import { TeamList } from "@/components/Team/TeamList";
import { TeamForm } from "@/components/Team/TeamForm";
import { useState } from "react";
import { UserPlus, FilePlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Team() {
  const [showForm, setShowForm] = useState(false);

  const handleImportSpreadsheet = () => {
    // TODO: Implement spreadsheet import functionality
    console.log("Import spreadsheet clicked");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Time</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Colaborador
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border shadow-lg">
            <DropdownMenuItem onClick={() => setShowForm(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Cadastrar Colaborador
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleImportSpreadsheet}>
              <FilePlus className="mr-2 h-4 w-4" />
              Importar Planilha
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showForm ? (
        <TeamForm onClose={() => setShowForm(false)} />
      ) : (
        <TeamList />
      )}
    </div>
  );
}