import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyP } from "@/components/ui/typography";
import LocationEnabler from "@/components/LocationEnabler";
import MakeRezzyDialog from "@/components/MakeRezzyDialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default async function Index() {

  const supabase = createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Check if user is 1) whitelisted, 2) if whitelisted: has rezzy or not already

  return (
    <div className="flex-1 w-full flex flex-col gap-10 items-center">
      <TypographyH1 className="mt-6 text-amber-300 text-center mb-5"> Trying to snag a tough reservation? </TypographyH1>
      <TypographyH2 className="text-center text-slate-700 w-2/3"> 
        Rezzy will notify you as soon as an opening appears with your specifications for any restaurant 
        on <a className="text-red-600" href="https://www.opentable.com/" target="_blank" rel="noopener noreferrer">OpenTable!</a>
      </TypographyH2>

      
      {/* <LocationEnabler/> */}
      <MakeRezzyDialog/>


      
    </div>
  );
}
