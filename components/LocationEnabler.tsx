"use client";

import { createClient } from "@/utils/supabase/client";
import { TypographyP } from "@/components/ui/typography";
import { useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import MoreInfo from "./MoreInfo";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

export default function LocationEnabler() {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  return (
    <>
      <Button className="mt-10" onClick={() => {toast({
          title: "Hi!",
          description: "test",
        })}}> Hi </Button>
      {/* {locationEnabled ? (
        <div className="w-full p-4 justify-left">
          <TypographyP className="">
            Location enabled: ✅ 
          </TypographyP>
        </div>
      ) : (
        <div className="w-full p-4 justify-left flex flex-row items-center">
          <TypographyP className="mr-1">
          </TypographyP>
          <MoreInfo/>
        </div>
      )} */}
    </>
  );
}
