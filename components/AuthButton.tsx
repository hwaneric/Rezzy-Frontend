import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "./ui/use-toast";



export default async function AuthButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const handleLogin = async () => {
    "use server";
    const supabase = createClient();

    const { error, data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // redirectTo: `http://localhost:3000/auth/callback`,
        redirectTo: `https://make-rezzy.vercel.app/auth/callback`,
      }
    });

    if (data.url) {
      redirect(data.url) // use the redirect API for your server framework
    }

    if (error) {
      // REDIRECT INSTEAD 
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center"> 
      <form action={handleLogin}>
        <Button size="lg">
          Login with Google
        </Button>
      </form>
    </div>
  )
}