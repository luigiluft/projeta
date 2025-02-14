
import { TableHead, TableRow } from "@/components/ui/table";

export function ProjectListHeader() {
  return (
    <TableRow className="bg-muted/50">
      <TableHead className="w-[40px]"></TableHead>
      <TableHead>Projeto</TableHead>
      <TableHead>Epic</TableHead>
      <TableHead>Tipo</TableHead>
      <TableHead className="text-right">Total Horas</TableHead>
      <TableHead className="text-right">Valor Total</TableHead>
      <TableHead className="text-right">Média HH</TableHead>
      <TableHead className="text-right">Data Conclusão</TableHead>
      <TableHead className="w-[100px]">Ações</TableHead>
    </TableRow>
  );
}
