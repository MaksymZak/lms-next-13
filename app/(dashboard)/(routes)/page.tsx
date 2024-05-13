import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return <UserButton afterSignOutUrl="/" />;
}

// # 9:55:00
