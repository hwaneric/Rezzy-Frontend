import { createClient } from "@/utils/supabase/server";
import LogoutButton from "./LogoutButton";
import { TypographyH1, TypographyH2, TypographyH3 } from "./ui/typography";


export default async function Header() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="flex p-4 items-center w-full">
        <a href="/login">
          <TypographyH1 className="text-purple-400">Rezzy 🍱</TypographyH1>
        </a>
        
      </div>
      <div className="w-full flex justify-end p-3 text-sm mr-3">
        { user && <LogoutButton /> }
      </div>
    </nav>
  );
}
