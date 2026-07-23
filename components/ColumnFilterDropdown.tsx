"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

interface ColumnFilterDropdownProps {
  label: string;
  options: readonly string[];
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
}

export default function ColumnFilterDropdown({
  label,
  options,
  selected,
  onChange,
}: ColumnFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const openDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 160),
      });
    }
    setOpen(true);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (opt: string) => {
    const next = new Set(selected);
    next.has(opt) ? next.delete(opt) : next.add(opt);
    onChange(next);
  };

  const isFiltered = selected.size > 0;

  return (
    <div className="relative w-full">
      <button
        ref={buttonRef}
        onClick={() => (open ? setOpen(false) : openDropdown())}
        className={`flex items-center justify-between gap-2 w-full ${
          isFiltered ? "text-teal-600" : "text-slate-400"
        } hover:text-slate-700`}
      >
        {label}
        <ChevronDown size={12} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "absolute", top: coords.top, left: coords.left, width: coords.width }}
            className="z-50 bg-[var(--panel-2)] border border-[var(--line-strong)] rounded-lg shadow-lg p-2 normal-case"
          >
            {isFiltered && (
              <button
                onClick={() => onChange(new Set())}
                className="w-full text-left text-xs text-white-400 hover:text-rose-500 px-2 py-1 mb-1 border-b border-slate-100"
              >
                Clear filter
              </button>
            )}
            {options.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 px-2 py-1.5 text-xs text-white-600 hover:bg-slate-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.has(opt)}
                  onChange={() => toggleOption(opt)}
                  className="accent-teal-500"
                />
                {opt}
              </label>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}