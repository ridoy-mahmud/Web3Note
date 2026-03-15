import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ReadingModeDialogProps {
  title: string;
  text: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReadingModeDialog = ({
  title,
  text,
  open,
  onOpenChange,
}: ReadingModeDialogProps) => {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-sm"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Reading mode"
        >
          <div className="h-full overflow-y-auto">
            <div className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur px-4 py-3 sm:px-6">
              <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold text-foreground sm:text-lg">
                    {title || "Untitled Note"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Exit reading mode"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
              <div className="whitespace-pre-wrap break-words text-base leading-8 text-foreground sm:text-lg sm:leading-10">
                {text || "This note has no text."}
              </div>
            </article>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReadingModeDialog;
