import { Search, Zap, LogOut } from "lucide-react";
import { useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
}

const Header = ({ search, onSearchChange }: HeaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, signOut } = useAuth();
  const userInitial =
    user?.displayName?.trim()?.charAt(0)?.toUpperCase() ||
    user?.email?.trim()?.charAt(0)?.toUpperCase() ||
    "U";
  const userFirstName =
    user?.displayName?.trim().split(/\s+/)[0] ||
    user?.email?.split("@")[0] ||
    "User";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !e.ctrlKey &&
        !e.metaKey &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <header className="min-h-16 w-[95%] lg:w-[80%] mx-auto border-b border-border flex items-center justify-between px-3 sm:px-6 lg:px-8 py-2 glass-panel sticky top-0 z-40 gap-2">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground tracking-tight hidden sm:block">
          Web3<span className="text-primary neon-text">NoteApp</span>
        </h1>
      </div>

      <div className="relative flex-1 max-w-md mx-2 sm:mx-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search notes... ( / )"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-muted rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-150"
          aria-label="Search notes"
        />
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-border"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full border border-border bg-muted text-foreground text-xs font-semibold flex items-center justify-center">
                {userInitial}
              </div>
            )}
            <span className="text-sm font-medium text-foreground max-w-[100px] sm:max-w-[160px] truncate">
              {userFirstName}
            </span>
            <button
              onClick={signOut}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
