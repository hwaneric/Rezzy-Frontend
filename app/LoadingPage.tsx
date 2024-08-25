import { TypographyH1 } from "@/components/ui/typography";
import { Loader2 } from "lucide-react";


export default function LoadingPage() {
  return (
    <div className="flex flex-col gap-4 justify-center items-center h-screen">
      <Loader2 className="h-16 w-16 animate-spin text-purple-400" />
      <TypographyH1 className="text-amber-300 mb-40">Loading...</TypographyH1>
    </div>
  )
}