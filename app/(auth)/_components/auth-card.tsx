import Image from "next/image";
import Link from "next/link";

interface AuthCardProps {
  title: string;
  description: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  children: React.ReactNode;
}

export const AuthCard = ({
  title,
  description,
  footerText,
  footerLinkLabel,
  footerLinkHref,
  children,
}: AuthCardProps) => {
  return (
    <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
      <div className="mb-6 flex flex-col items-center gap-y-2 text-center">
        <Image height={40} width={40} alt="logo" src="/logo.svg" />
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      {children}
      <p className="mt-6 text-center text-sm text-slate-600">
        {footerText}{" "}
        <Link
          href={footerLinkHref}
          className="font-medium text-sky-700 hover:underline"
        >
          {footerLinkLabel}
        </Link>
      </p>
    </div>
  );
};
