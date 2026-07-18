"use client";

import { Search, X } from "lucide-react";
import { STATUSES } from "@/lib/constants";
import { Status } from "@/lib/types";

interface FilterBarProps {
  query: string;
  setQuery: (value: string) => void;
  statusFilter: Status | "All";
  setStatusFilter: (value: Status | "All") => void;
  visibleCount: number;
  totalCount: number;
}

/** Search box + status filter dropdown sitting above the table. */
export default function FilterBar({
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  visibleCount,
  totalCount,
}: FilterBarProps) {
  const hasActiveFilters = query || statusFilter !== "All";

  return (
    <div className="px-6 py-3 flex items-center gap-3 bg-slate-100">
      <div className="relative flex-1 max-w-sm">
        <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search agencies..."
          className="w-full text-sm pl-8 pr-3 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as Status | "All")}
        className="text-sm px-2 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <option value="All">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select> */}

      {hasActiveFilters && (
        <button
          onClick={() => {
            setQuery("");
            setStatusFilter("All");
          }}
          className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          <X size={13} /> Clear filters
        </button>
      )}

      <span className="ml-auto text-xs text-slate-400">
        Showing {visibleCount} of {totalCount}
      </span>
    </div>
  );
}
