import { CodeBlock } from '@/types/note';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockDisplayProps {
  block: CodeBlock;
  compact?: boolean;
}

const languageColors: Record<string, string> = {
  javascript: 'text-yellow-400',
  typescript: 'text-blue-400',
  python: 'text-green-400',
  html: 'text-orange-400',
  css: 'text-pink-400',
  json: 'text-amber-400',
  sql: 'text-cyan-400',
  bash: 'text-emerald-400',
  default: 'text-muted-foreground',
};

const CodeBlockDisplay = ({ block, compact = false }: CodeBlockDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(block.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const colorClass = languageColors[block.language] || languageColors.default;

  return (
    <div className="rounded-lg bg-background/60 border border-border overflow-hidden group/code">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-b border-border">
        <span className={`text-[10px] font-mono font-medium uppercase ${colorClass}`}>
          {block.language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="p-1 rounded text-muted-foreground hover:text-foreground opacity-0 group-hover/code:opacity-100 transition-opacity"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
      <pre className={`px-3 py-2 overflow-x-auto text-foreground font-mono ${compact ? 'text-[10px] max-h-24' : 'text-xs max-h-64'}`}>
        <code>{block.code}</code>
      </pre>
    </div>
  );
};

export default CodeBlockDisplay;
