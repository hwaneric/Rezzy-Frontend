import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "./ui/use-toast";



export default async function AuthButton() {
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

  const handleLogin = async () => {
    "use server";
    const supabase = createClient();

    const { error, data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `http://localhost:3000/auth/callback`,
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
    if (true) {
      // REDIRECT INSTEAD 
      return toast({
        title: "Something went wrong.",
        description: "rtest",
        variant: "destructive",
      });
    }
    // return redirect("/login");

    // router.refresh();
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
  
  
  // user ? (
  //   <div className="flex items-center gap-4">
  //     Hey, {user.email}!
  //     <form action={signOut}>
  //       <Button>
  //         Logout
  //       </Button>
  //     </form>
  //   </div>
  // ) : (
  //   <form action={handleLogin}>
  //     <Button>
  //       Login
  //     </Button>
  //   </form>
  // );
}
