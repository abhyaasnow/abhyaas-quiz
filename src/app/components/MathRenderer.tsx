'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  text?: string;
  className?: string;
}

export default function MathRenderer({ text = '', className = '' }: MathRendererProps) {
  if (!text || typeof text !== 'string') return null;

  let processedText = text.trim();

  const hasLatexCommands = /\\[a-zA-Z]+/.test(processedText) || processedText.includes('_') || processedText.includes('^');
  const hasDollar = processedText.includes('$');

  if (!hasDollar && hasLatexCommands) {
    processedText = `$${processedText}$`;
  }

  const parts = processedText.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);

  return (
    <span className={`inline-block max-w-full align-middle ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2).trim();
          return (
            <div key={index} className="my-2 overflow-x-auto py-1 text-center">
              <BlockMath math={math} errorColor="#e11d48" />
            </div>
          );
        }

        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1).trim();
          return (
            <span key={index} className="inline-block mx-0.5">
              <InlineMath math={math} errorColor="#e11d48" />
            </span>
          );
        }

        if (part.includes('\\frac') || part.includes('\\int') || part.includes('\\sum')) {
          try {
            return (
              <span key={index} className="inline-block mx-0.5">
                <InlineMath math={part.trim()} errorColor="#e11d48" />
              </span>
            );
          } catch {
            return <span key={index}>{part}</span>;
          }
        }

        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}