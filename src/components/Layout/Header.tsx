import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b bg-white p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">Project Management</h1>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
            U
          </div>
        </div>
      </div>
    </header>
  );
}