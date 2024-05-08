import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return <UserButton afterSignOutUrl="/" />;
}

// # 5:54:00
