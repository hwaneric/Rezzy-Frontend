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
import MakeRezzyPage from "./MakeRezzyPage";
import DisplayRezzyPage from "./DisplayRezzyPage";


type rezzyType = Database['public']['Tables']["rezzys"]["Row"];

export default async function Index() {
  const supabase = createClient();

  const {data: { user }} = await supabase.auth.getUser();

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

  return (rezzy ? (
    <DisplayRezzyPage isWhitelisted={isWhitelisted} rezzy={rezzy} />
  ) : (
    <MakeRezzyPage isWhitelisted={isWhitelisted}/>
  ));
}
