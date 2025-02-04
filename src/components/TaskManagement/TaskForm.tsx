import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Task } from "@/types/project";

interface TaskFormProps {
  onSubmit: (values: Omit<Task, "id">) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskForm({ onSubmit, open, onOpenChange }: TaskFormProps) {
  const [values, setValues] = useState<Omit<Task, "id">>({
    itemType: "",
    itemKey: "",
    itemId: 0,
    summary: "",
    assignee: "",
    assigneeId: "",
    reporter: "",
    reporterId: "",
    priority: "",
    status: "",
    resolution: "",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    resolved: "",
    components: "",
    affectedVersion: "",
    fixVersion: "",
    sprints: "",
    timeTracking: "",
    internalLinks: [],
    externalLinks: "",
    originalEstimate: 0,
    parentId: 0,
    parentSummary: "",
    startDate: "",
    totalOriginalEstimate: 0,
    totalTimeSpent: 0,
    remainingEstimate: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Resumo"
              value={values.summary}
              onChange={(e) => setValues({ ...values, summary: e.target.value })}
            />
          </div>
          <div>
            <Input
              placeholder="Responsável"
              value={values.assignee}
              onChange={(e) => setValues({ ...values, assignee: e.target.value })}
            />
          </div>
          <div>
            <Input
              placeholder="Prioridade"
              value={values.priority}
              onChange={(e) => setValues({ ...values, priority: e.target.value })}
            />
          </div>
          <div>
            <Input
              placeholder="Status"
              value={values.status}
              onChange={(e) => setValues({ ...values, status: e.target.value })}
            />
          </div>
          <Button type="submit">Criar Tarefa</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}