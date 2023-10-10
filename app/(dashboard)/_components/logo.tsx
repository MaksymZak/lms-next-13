import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href={"/"} className="cursor-pointer">
      <Image
        className="h-auto"
        alt="logo"
        src="/logo.svg"
        width={130}
        height={130}
      />
    </Link>
  );
};

export default Logo;
