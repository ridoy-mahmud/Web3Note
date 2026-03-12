import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ListChecks, FileText, Calendar, X } from 'lucide-react';
import { Note } from '@/types/note';
import { createChecklistItem } from '@/lib/storage';

interface QuickCreateProps {
  onAdd: (partial: Partial<Note>) => void;
}

const QuickCreate = ({ onAdd }: QuickCreateProps) => {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'note' | 'checklist'>('note');
  const [reminderAt, setReminderAt] = useState('');

  const reset = () => {
    setTitle('');
    setContent('');
    setType('note');
    setReminderAt('');
    setExpanded(false);
  };

  const handleSubmit = () => {
    if (!title.trim() && !content.trim()) return;
    const items = type === 'checklist'
      ? content.split('\n').filter(l => l.trim()).map(l => createChecklistItem(l.trim()))
      : [];
    onAdd({
      title,
      type,
      content: type === 'note' ? content : '',
      items,
      images: [],
      codeBlocks: [],
      metadata: {
        showDateOnCard: !!reminderAt,
        reminderAt: reminderAt ? new Date(reminderAt).toISOString() : null,
      },
    });
    reset();
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <motion.div
        layout
        className="glass-panel rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background transition-shadow"
      >
        {!expanded ? (
          <button
            onClick={() => setExpanded(true)}
            className="w-full flex items-center gap-3 px-5 py-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Create new note"
          >
            <Plus className="w-5 h-5 text-primary" />
            <span className="text-base font-medium">New note...</span>
          </button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="p-5 space-y-3"
            >
              <input
                autoFocus
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-foreground font-bold text-xl placeholder:text-muted-foreground focus:outline-none"
                aria-label="Note title"
              />
              <textarea
                placeholder={type === 'checklist' ? 'One item per line...' : 'Take a note...'}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="w-full bg-transparent text-foreground text-sm placeholder:text-muted-foreground focus:outline-none resize-none leading-relaxed"
                aria-label="Note content"
              />

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setType('note')}
                  className={`p-2 rounded-full transition-colors ${type === 'note' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                  aria-label="Text note"
                  aria-pressed={type === 'note'}
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setType('checklist')}
                  className={`p-2 rounded-full transition-colors ${type === 'checklist' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                  aria-label="Checklist"
                  aria-pressed={type === 'checklist'}
                >
                  <ListChecks className="w-4 h-4" />
                </button>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="datetime-local"
                    value={reminderAt}
                    onChange={(e) => setReminderAt(e.target.value)}
                    className="bg-muted text-foreground text-xs rounded-md pl-8 pr-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
                    aria-label="Set reminder"
                  />
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={reset}
                    className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    aria-label="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
                    aria-label="Save note"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
};

export default QuickCreate;
