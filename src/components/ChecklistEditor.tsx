import { ChecklistItem } from '@/types/note';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistEditorProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  readonly?: boolean;
}

const ChecklistEditor = ({ items, onChange, readonly = false }: ChecklistEditorProps) => {
  const toggle = (id: string) => {
    onChange(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const updateText = (id: string, text: string) => {
    onChange(items.map(i => i.id === id ? { ...i, text } : i));
  };

  return (
    <div className="space-y-1" role="list" aria-label="Checklist items">
      {items.map(item => (
        <div
          key={item.id}
          className="flex items-center gap-2 group"
          role="listitem"
        >
          <button
            onClick={() => toggle(item.id)}
            className={cn(
              'w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all duration-150',
              item.checked
                ? 'bg-primary border-primary'
                : 'border-muted-foreground/40 hover:border-primary'
            )}
            aria-label={`${item.checked ? 'Uncheck' : 'Check'} ${item.text}`}
            disabled={readonly}
          >
            {item.checked && <Check className="w-3 h-3 text-primary-foreground" />}
          </button>
          {readonly ? (
            <span className={cn(
              'text-sm leading-relaxed',
              item.checked ? 'text-muted-foreground line-through' : 'text-foreground'
            )}>
              {item.text}
            </span>
          ) : (
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateText(item.id, e.target.value)}
              className={cn(
                'flex-1 bg-transparent text-sm focus:outline-none',
                item.checked ? 'text-muted-foreground line-through' : 'text-foreground'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ChecklistEditor;
