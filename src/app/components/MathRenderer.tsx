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

  let processedText = text;

  // 1. अगर स्ट्रिंग में $ नहीं है लेकिन LaTeX कमांड्स (\frac, \int, \pi, \sqrt आदि) मौजूद हैं
  const hasLatexCommands = /\\[a-zA-Z]+/.test(processedText);
  const hasDollar = processedText.includes('$');

  if (!hasDollar && hasLatexCommands) {
    processedText = `$${processedText}$`;
  }

  // 2. Block ($$...$$) और Inline ($...$) गणितीय सूत्रों को अलग-अलग पार्स करें
  const parts = processedText.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);

  return (
    <span className={`inline-block max-w-full align-middle ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Block Math ($$...$$)
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2).trim();
          return (
            <div key={index} className="my-2 overflow-x-auto py-1">
              <BlockMath math={math} errorColor="#e11d48" />
            </div>
          );
        }

        // Inline Math ($...$)
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1).trim();
          return (
            <span key={index} className="inline-block mx-0.5">
              <InlineMath math={math} errorColor="#e11d48" />
            </span>
          );
        }

        // सामान्य टेक्स्ट
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}