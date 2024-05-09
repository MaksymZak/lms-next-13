import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return <UserButton afterSignOutUrl="/" />;
}

// # 7:07:00
