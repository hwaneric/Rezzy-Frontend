import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyP } from "@/components/ui/typography";
import MakeRezzyDialog from "@/components/MakeRezzyDialog";
import { Database } from "@/database.types";
import RezzyDisplayCard from "@/components/RezzyDisplayCard";
import ErrorPage from "@/components/ErrorPage";
import DemoAlert from "@/components/DemoAlert";
import LoadingSpinner from "@/icons/LoadingSpinner";
import { Loader2, Loader } from "lucide-react";


type rezzyType = Database['public']['Tables']["rezzys"]["Row"];


export default async function Index() {
  const supabase = createClient();
  let loading = true;



  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: whitelist, error: whitelistFetchError } = await supabase
    .from("profiles")
    .select("whitelisted")
    .eq("id", user.id)
    .limit(1)
    .single();

  if (whitelistFetchError || !whitelist) {
    return <ErrorPage statusCode={403} title={"There was a problem fetching your user information. Please try again"}/>
  }

  const isWhitelisted: boolean = whitelist.whitelisted;
  

  const { data: rezzyData, error: rezzyFetchError } = await supabase
    .from("rezzys")
    .select()
    .eq("user_email", user.email)
    .limit(1)
  
  if (rezzyFetchError) {
    return <ErrorPage statusCode={403} title={"There was a problem fetching your user information. Please try again"}/>
  }
  
  const rezzy: rezzyType | null = rezzyData && rezzyData[0];

  loading = false;
  console.log("rezzy: ", rezzy)

  return ( rezzy ? (
    <div className="flex-1 flex flex-col w-full items-center">
      {!isWhitelisted && 
        <DemoAlert/>
      }

      { loading && <Loader className="h-4 w-4 animate-spin" /> }

      
      
      <TypographyH1 className="text-amber-300 text-center mt-8"> Welcome to Rezzy! </TypographyH1>
      <TypographyP className="w-2/3 text-center mb-10">
        We will let you know when your reservation becomes available. 
        <br/> 
        <span className="font-style: italic">
          Please cancel your existing Rezzy to make a new one.
        </span>
        
        </TypographyP>

        <RezzyDisplayCard rezzy={rezzy}/>
        
    </div>
  ) : (
    <div className="flex-1 w-full flex flex-col gap-10 items-center">
      {!isWhitelisted && 
        <DemoAlert/>
      }

      {/* Put everything into a client component wrapper  */}

      { loading && <Loader className="h-4 w-4 animate-spin" /> }
      
      <TypographyH1 className="mt-6 text-amber-300 text-center mb-5"> Trying to snag a tough reservation? </TypographyH1>
      <TypographyH2 className="text-center text-slate-700 w-2/3"> 
        Rezzy will notify you as soon as an opening appears with your specifications for any restaurant 
        on <a className="text-red-600" href="https://www.opentable.com/" target="_blank" rel="noopener noreferrer">OpenTable!</a>
      </TypographyH2>

      
      <MakeRezzyDialog />
    </div>
  ));
}
