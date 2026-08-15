'use client';

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por marca ou modelo..."
        className="w-full rounded-xl bg-zinc-900 border border-white/10 pl-11 pr-10 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary/50 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
