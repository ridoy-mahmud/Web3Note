import { FilterType, SortType } from "@/types/note";
import { cn } from "@/lib/utils";
import {
  Inbox,
  CheckCircle2,
  CalendarDays,
  Clock,
  Pin,
  Archive,
  Trash2,
  Star,
  ArrowDownWideNarrow,
} from "lucide-react";

interface FiltersBarProps {
  filter: FilterType;
  sort: SortType;
  onFilterChange: (f: FilterType) => void;
  onSortChange: (s: SortType) => void;
}

const filters: {
  key: FilterType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "all", label: "All", icon: Inbox },
  { key: "active", label: "Active", icon: Star },
  { key: "completed", label: "Done", icon: CheckCircle2 },
  { key: "today", label: "Today", icon: CalendarDays },
  { key: "upcoming", label: "Upcoming", icon: Clock },
  { key: "pinned", label: "Pinned", icon: Pin },
  { key: "archived", label: "Archived", icon: Archive },
  { key: "trash", label: "Trash", icon: Trash2 },
];

const sorts: { key: SortType; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "custom", label: "Custom" },
];

const FiltersBar = ({
  filter,
  sort,
  onFilterChange,
  onSortChange,
}: FiltersBarProps) => {
  return (
    <div className="h-14 w-[95%] lg:w-[80%] mx-auto flex items-center gap-2 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-hide sticky top-16 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {filters.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
              filter === key
                ? "bg-primary text-primary-foreground neon-glow"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary",
            )}
            aria-pressed={filter === key}
            aria-label={`Filter: ${label}`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
        <ArrowDownWideNarrow className="w-4 h-4 text-muted-foreground" />
        {sorts.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onSortChange(key)}
            className={cn(
              "px-2.5 py-1 rounded-md text-sm font-medium transition-all duration-150",
              sort === key
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FiltersBar;
