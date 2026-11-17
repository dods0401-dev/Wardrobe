import { createRoot } from "react-dom/client";
import { AppShell } from "@/components/layout/AppShell";
import { usePathname } from "./router";
import Home from "@/app/page";
import Wardrobe from "@/app/wardrobe/page";
import Item from "@/app/wardrobe/[id]/page";
import Stylist from "@/app/stylist/page";
import Results from "@/app/stylist/results/page";
import OutfitDetail from "@/app/outfits/[id]/page";
import Lookbook from "@/app/lookbook/page";
import Profile from "@/app/profile/page";
import Stats from "@/app/stats/page";
import Design from "@/app/design/page";

function Routes() {
  const path = usePathname();
  const parts = path.split("/").filter(Boolean);
  let page;
  if (!parts.length) page = <Home />;
  else if (parts[0] === "wardrobe") page = parts[1] ? <Item key={parts[1]} /> : <Wardrobe />;
  else if (parts[0] === "stylist") page = parts[1] === "results" ? <Results /> : <Stylist />;
  else if (parts[0] === "outfits") page = <OutfitDetail key={parts[1]} />;
  else if (parts[0] === "lookbook") page = <Lookbook />;
  else if (parts[0] === "profile") page = <Profile />;
  else if (parts[0] === "stats") page = <Stats />;
  else if (parts[0] === "design") page = <Design />;
  else page = <Home />;
  return <AppShell>{page}</AppShell>;
}

createRoot(document.getElementById("root")!).render(<Routes />);
