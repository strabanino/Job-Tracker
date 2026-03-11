import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Prospect } from "@shared/schema";
import { STATUSES, INTEREST_LEVELS } from "@shared/schema";
import { ProspectCard } from "@/components/prospect-card";
import { AddProspectForm } from "@/components/add-prospect-form";
import { Briefcase, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const columnColors: Record<string, string> = {
  Bookmarked: "bg-blue-500",
  Applied: "bg-indigo-500",
  "Phone Screen": "bg-violet-500",
  Interviewing: "bg-amber-500",
  Offer: "bg-emerald-500",
  Rejected: "bg-red-500",
  Withdrawn: "bg-gray-500",
};

function KanbanColumn({
  status,
  prospects,
  isLoading,
  filter,
  onFilterChange,
  hasSearchQuery,
}: {
  status: string;
  prospects: Prospect[];
  isLoading: boolean;
  filter: string;
  onFilterChange: (value: string) => void;
  hasSearchQuery: boolean;
}) {
  const filteredProspects =
    filter === "All"
      ? prospects
      : prospects.filter((p) => p.interestLevel === filter);

  const slugifiedStatus = status.replace(/\s+/g, "-").toLowerCase();

  return (
    <div
      className="flex flex-col min-w-[260px] max-w-[320px] w-full bg-muted/40 rounded-md"
      data-testid={`column-${slugifiedStatus}`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
        <div className={`w-2 h-2 rounded-full shrink-0 ${columnColors[status] || "bg-gray-400"}`} />
        <h3 className="text-sm font-semibold truncate">{status}</h3>
        <Badge
          variant="secondary"
          className="ml-auto text-[10px] px-1.5 py-0 h-5 min-w-[20px] flex items-center justify-center no-default-active-elevate shrink-0"
          data-testid={`badge-count-${slugifiedStatus}`}
        >
          {filteredProspects.length}
        </Badge>
      </div>

      <div className="px-2 pt-2">
        <Select
          value={filter}
          onValueChange={onFilterChange}
        >
          <SelectTrigger
            className="h-7 text-xs w-full"
            data-testid={`select-filter-${slugifiedStatus}`}
          >
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All" data-testid={`option-all-${slugifiedStatus}`}>All</SelectItem>
            {INTEREST_LEVELS.map((level) => (
              <SelectItem
                key={level}
                value={level}
                data-testid={`option-${level.toLowerCase()}-${slugifiedStatus}`}
              >
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-28 rounded-md" />
              <Skeleton className="h-20 rounded-md" />
            </>
          ) : filteredProspects.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-8 text-center"
              data-testid={`empty-${slugifiedStatus}`}
            >
              <p className="text-xs text-muted-foreground">
                {hasSearchQuery
                  ? "No matching results"
                  : filter === "All"
                    ? "No prospects"
                    : `No ${filter} interest prospects`}
              </p>
            </div>
          ) : (
            filteredProspects.map((prospect) => (
              <ProspectCard key={prospect.id} prospect={prospect} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    () => Object.fromEntries(STATUSES.map((s) => [s, "All"]))
  );

  const { data: prospects, isLoading } = useQuery<Prospect[]>({
    queryKey: ["/api/prospects"],
  });

  const trimmedSearch = searchQuery.trim().toLowerCase();
  const visibleProspects = trimmedSearch
    ? (prospects ?? []).filter(
        (p) =>
          p.companyName.toLowerCase().includes(trimmedSearch) ||
          p.roleTitle.toLowerCase().includes(trimmedSearch)
      )
    : (prospects ?? []);

  const groupedByStatus = STATUSES.reduce(
    (acc, status) => {
      acc[status] = visibleProspects.filter((p) => p.status === status);
      return acc;
    },
    {} as Record<string, Prospect[]>,
  );

  const totalCount = prospects?.length ?? 0;

  function handleFilterChange(status: string, value: string) {
    setColumnFilters((prev) => ({ ...prev, [status]: value }));
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm shrink-0 z-50">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight leading-tight" data-testid="text-app-title">
                  JobTrackr
                </h1>
                <p className="text-xs text-muted-foreground" data-testid="text-prospect-count">
                  {totalCount} prospect{totalCount !== 1 ? "s" : ""} tracked
                </p>
              </div>
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search jobs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm"
                data-testid="input-search"
              />
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-prospect">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Prospect
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Prospect</DialogTitle>
                </DialogHeader>
                <AddProspectForm onSuccess={() => setDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3 p-4 h-full min-w-max">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              prospects={groupedByStatus[status] || []}
              isLoading={isLoading}
              filter={columnFilters[status]}
              onFilterChange={(value) => handleFilterChange(status, value)}
              hasSearchQuery={trimmedSearch.length > 0}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
