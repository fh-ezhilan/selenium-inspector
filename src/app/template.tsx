import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import { TestCasesPane } from "@/components/test-cases-pane";

export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <SidebarNav />
        <SidebarInset>
            <div className="flex flex-1">
                <div className="flex flex-1 flex-col">{children}</div>
                <TestCasesPane />
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
