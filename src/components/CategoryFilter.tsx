import { Category, CATEGORY_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selected: Category | 'all';
  onChange: (cat: Category | 'all') => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const categories: (Category | 'all')[] = ['all', 'books', 'stationery', 'kit', 'uniform', 'electronics', 'notes', 'other'];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn(
            'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            selected === cat
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-card text-muted-foreground hover:bg-muted border border-border'
          )}
        >
          {cat === 'all' ? '🛍️ All' : CATEGORY_LABELS[cat]}
        </button>
      ))}
    </div>
  );
}
