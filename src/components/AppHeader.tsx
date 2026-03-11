import { Link, useLocation } from "react-router-dom";
import { Search, Coffee, User, Map, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  onSearchClick?: () => void;
}

export function AppHeader({ onSearchClick }: AppHeaderProps) {
  const { pathname } = useLocation();

  return (
    <header className="h-16 flex items-center justify-between px-4 bg-card/90 backdrop-blur-md border-b border-border z-50">
      <Link to="/" className="flex items-center gap-2">
        <Coffee className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="font-heading text-xl text-foreground leading-tight">Brew & Bean</span>
          <span className="text-sm text-muted-foreground leading-tight">Hand-picked indie coffee shops across London</span>
        </div>
      </Link>

      {/* View toggle */}
      <div className="flex items-center gap-0.5 bg-secondary rounded-lg p-0.5">
        <Link to="/">
          <Button
            variant={pathname === "/" ? "default" : "ghost"}
            size="sm"
            className={`h-7 px-2.5 gap-1 text-xs ${pathname === "/" ? "bg-foreground text-background" : "text-muted-foreground"}`}
          >
            <Map className="h-3.5 w-3.5" />
            Map
          </Button>
        </Link>
        <Link to="/nearby">
          <Button
            variant={pathname === "/nearby" ? "default" : "ghost"}
            size="sm"
            className={`h-7 px-2.5 gap-1 text-xs ${pathname === "/nearby" ? "bg-foreground text-background" : "text-muted-foreground"}`}
          >
            <List className="h-3.5 w-3.5" />
            List
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={onSearchClick}>
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
