import Loader from "@/components/loader/loader";
import Navbar from "../_components/navbar";
import Sidebar from "../_components/sidebar";
import { Suspense } from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      <div className="fixed inset-y-0 z-50 h-[80px] w-full md:pl-56">
        <Navbar />
      </div>
      <div className="fixed inset-y-0 z-50 hidden h-full w-56 flex-col md:flex">
        <Sidebar />
      </div>

      <main className="h-full pt-[80px] md:pl-56">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <Loader />
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
};

export default DashboardLayout;
