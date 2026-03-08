import { Link } from "react-router-dom";
import { Search, Coffee, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  onSearchClick?: () => void;
}

export function AppHeader({ onSearchClick }: AppHeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 bg-card/90 backdrop-blur-md border-b border-border z-50">
      <Link to="/" className="flex items-center gap-2">
        <Coffee className="h-5 w-5 text-primary" />
        <span className="font-heading text-lg text-foreground">Brew & Bean</span>
      </Link>
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
