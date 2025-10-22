"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = "bash",
  filename,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='group relative my-4 rounded-lg border bg-zinc-950 dark:bg-zinc-900'>
      {filename && (
        <div className='flex items-center justify-between border-b border-zinc-800 px-4 py-2'>
          <span className='text-sm font-mono text-zinc-400'>{filename}</span>
          <span className='text-xs text-zinc-500 uppercase'>{language}</span>
        </div>
      )}
      <div className='relative'>
        <Button
          variant='ghost'
          size='icon'
          className='absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity'
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className='h-4 w-4 text-green-500' />
          ) : (
            <Copy className='h-4 w-4' />
          )}
        </Button>
        <pre className='overflow-x-auto p-4 text-sm'>
          <code className='font-mono text-zinc-100'>
            {showLineNumbers ? (
              <div>
                {code.split('\n').map((line, i) => (
                  <div key={i} className='table-row'>
                    <span className='table-cell pr-4 text-right text-zinc-500 select-none'>
                      {i + 1}
                    </span>
                    <span className='table-cell'>{line}</span>
                  </div>
                ))}
              </div>
            ) : (
              code
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}

