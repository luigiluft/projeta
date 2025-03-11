import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/project";
import { CalendarIcon, PlusCircle, Trash2, RefreshCw, Wand2 } from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useResourceAllocation } from "@/hooks/useResourceAllocation";
import { useAutoAllocation } from "@/hooks/useAutoAllocation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQueryClient } from "@tanstack/react-query";

interface AllocationTabProps {
  tasks: Task[];
  projectId?: string;
}

const allocationFormSchema = z.object({
  task_id: z.string().optional(),
  member_id: z.string({ required_error: "Selecione um membro da equipe" }),
  start_date: z.date({ required_error: "Data de início é obrigatória" }),
  end_date: z.date({ required_error: "Data de fim é obrigatória" }),
  allocated_hours: z.coerce.number().min(1, "Deve alocar pelo menos 1 hora"),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"], {
    required_error: "Selecione um status",
  }),
});

type AllocationFormValues = z.infer<typeof allocationFormSchema>;

export function AllocationTab({ tasks, projectId }: AllocationTabProps) {
  // Rest of the component implementation remains unchanged
}
