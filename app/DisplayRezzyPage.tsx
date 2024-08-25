"use client";

import { TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyP } from "@/components/ui/typography";
import { Database } from "@/database.types";
import RezzyDisplayCard from "@/components/RezzyDisplayCard";
import DemoAlert from "@/components/DemoAlert";
import { useState } from "react";
import LoadingPage from "./LoadingPage";

type rezzyType = Database['public']['Tables']["rezzys"]["Row"];

export default function DisplayRezzyPage({isWhitelisted, rezzy }: {isWhitelisted: boolean, rezzy: rezzyType}) {
  const [loading, setLoading] = useState(false);

  return (
    loading ? (
      <LoadingPage/>
    ) : (
      <div className="flex-1 flex flex-col w-full items-center">
        {!isWhitelisted && 
          <DemoAlert/>
        }

        <TypographyH1 className="text-amber-300 text-center mt-8"> Welcome to Rezzy! </TypographyH1>
        <TypographyP className="w-2/3 text-center mb-10">
          We will let you know when your reservation becomes available. 
          <br/> 
          <span className="font-style: italic">
            Please cancel your existing Rezzy to make a new one.
          </span>
          
          </TypographyP>

          <RezzyDisplayCard rezzy={rezzy} setLoading={setLoading}/>
          
      </div>
    )
    
  )
  
}