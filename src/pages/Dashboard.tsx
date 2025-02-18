
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { Header } from "@/components/Layout/Header";

const Dashboard = () => {
  return (
    <div className="flex h-screen w-full bg-gray-50/80">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
