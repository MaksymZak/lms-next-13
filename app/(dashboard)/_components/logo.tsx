import Image from "next/image";

const Logo = () => {
  return (
    <Image
      className="h-auto"
      alt="logo"
      src="/logo.svg"
      width={130}
      height={130}
    />
  );
};

export default Logo;
