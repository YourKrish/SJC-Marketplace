import { Category, CATEGORY_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  BookOpen,
  PenLine,
  Dumbbell,
  Shirt,
  Laptop,
  FileText,
  CircleEllipsis,
  LucideIcon,
} from 'lucide-react';

interface CategoryFilterProps {
  selected: Category | 'all';
  onChange: (cat: Category | 'all') => void;
}

const CATEGORY_ICONS: Record<Category | 'all', LucideIcon> = {
  all: LayoutGrid,
  books: BookOpen,
  stationery: PenLine,
  kit: Dumbbell,
  uniform: Shirt,
  electronics: Laptop,
  notes: FileText,
  other: CircleEllipsis,
};

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const categories: (Category | 'all')[] = ['all', 'books', 'stationery', 'kit', 'uniform', 'electronics', 'notes', 'other'];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
      {categories.map((cat) => {
        const Icon = CATEGORY_ICONS[cat];
        const isOn = selected === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={cn(
              'shrink-0 inline-flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ease-out',
              'border border-transparent',
              isOn
                ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border-border/60'
            )}
          >
            <Icon className={cn('w-4 h-4 shrink-0 transition-transform duration-200', isOn && 'scale-105')} aria-hidden />
            {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
          </button>
        );
      })}
    </div>
  );
}
