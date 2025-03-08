
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-[72px]">
        <SidebarProvider>
          <div className="flex w-full">
            <AppSidebar />
            <main className="flex-1 p-6 ml-0 md:ml-[16rem]">
              <Outlet />
            </main>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
