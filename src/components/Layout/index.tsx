
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <div className="pt-[72px]">
        <SidebarProvider>
          <div className="flex w-full">
            <AppSidebar />
            <main className="flex-1 p-6 ml-0 md:ml-[16rem] bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-72px)]">
              <Outlet />
            </main>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
