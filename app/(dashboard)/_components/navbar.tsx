import MobileSidebar from "./mobile-sedebar";
import NavbarRoutes from "@/components/navbar-routes";

const Navbar = () => {
    return (
        <div className="p-3 border-b h-full flex items-center bg-white shadow-sm"><MobileSidebar />
        
        <NavbarRoutes/>
        </div>
    );
}

export default Navbar;