"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to chat page immediately
    router.replace("/chat");
  }, [router]);

  return (
    <div className="h-screen bg-[#212121] flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  );
}
