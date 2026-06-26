"use client";
import { BomProvider } from "@/features/bom/store";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Loader2 size={48} className="animate-spin text-primary" />
        </div>
      }
    >
      <BomProvider>{children}</BomProvider>
    </Suspense>
  );
}
