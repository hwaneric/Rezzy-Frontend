import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubmitButton } from "./submit-button";
import { TypographyH1, TypographyH2, TypographyH3} from "@/components/ui/typography";
import AuthButton from "@/components/AuthButton";

export default async function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser(); 

  if (user) {
    return redirect("/");
  }

  return (
    <div className="flex-1 flex flex-col px-8 gap-4">
      <TypographyH1 className="text-center mt-40  text-slate-700">
        Welcome to <span className="text-purple-400">Rezzy!</span>
      </TypographyH1>
      <TypographyH3 className="text-center mb-8 text-amber-300">
        🎉 Never miss a reservation again 👀
      </TypographyH3>
{/* 
      <TypographyH2 className="text-center text-slate-800">
        We are currently whitelist-only. <br/> If you have an invite, please sign-in below!
      </TypographyH2> */}
      {/* <TypographyH2 className="text-center text-slate-700 ">Please login below using Google</TypographyH2> */}
      <AuthButton/>
    </div>
  );
}
