import MobileSidebar from "./mobile-sedebar";
import { NavbarRoutes } from "@/components/navbar-routes";

const Navbar = () => {
  return (
    <div className="flex h-full items-center border-b bg-white p-3 shadow-sm">
      <MobileSidebar />

      <NavbarRoutes />
    </div>
  );
};

export default Navbar;
