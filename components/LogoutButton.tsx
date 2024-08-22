import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "./ui/use-toast";



export default async function LogoutButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();


  const signOut = async () => {
    "use server";

    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/");
  };

  
  return (
    <div> 
      <form action={signOut}>
        <Button>
          Logout
        </Button>
      </form>
    </div>
  )
}