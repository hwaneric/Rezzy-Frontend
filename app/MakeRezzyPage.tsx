"use client"


import { TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyP } from "@/components/ui/typography";
import MakeRezzyDialog from "@/components/MakeRezzyDialog";
import DemoAlert from "@/components/DemoAlert";
import { useState } from "react";
import LoadingPage from "./LoadingPage";

export default function MakeRezzyPage({isWhitelisted }: {isWhitelisted: boolean}) {
  const [loading, setLoading] = useState(false);

  return (
    


      loading ? (
        <LoadingPage/>
      ) : (
        <div className="flex-1 w-full flex flex-col gap-10 items-center mb-32">
          {!isWhitelisted && 
            <DemoAlert/>
          }

          <TypographyH1 className="mt-4 text-amber-300 text-center mb-4"> Trying to snag a tough reservation? </TypographyH1>
          <TypographyH2 className="text-center text-slate-700 w-2/3"> 
            Rezzy will notify you as soon as an opening appears with your specifications for any restaurant 
            on <a className="text-red-600 hover:underline hover:cursor-pointer" href="https://www.opentable.com/" target="_blank" rel="noopener noreferrer">OpenTable!</a>
          </TypographyH2>

          <MakeRezzyDialog setLoading={setLoading} />
        </div>
      )
      
      
    
  )
}