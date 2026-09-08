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

  // 1. KaTeX crash karne wale Unicode symbols ko sanitize karein
  let cleanText = text
    .replace(/\\le\s+ft/g, '\\left')
    .replace(/\\ri\s+ght/g, '\\right')
    .replace(/→/g, '\\to ')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/±/g, '\\pm ')
    .replace(/≠/g, '\\ne ')
    .replace(/∞/g, '\\infty ');

  // 2. Normal text ko Markdown (Bold, Italics, Line Breaks) ke sath render karne ka engine
  const renderTextWithFormatting = (plainStr: string, baseKey: string | number) => {
    // Newlines (\n) ko preserve karein taaki Enter dabane par lines alag rahein
    const lines = plainStr.split('\n');

    return (
      <span key={baseKey}>
        {lines.map((line, lIdx) => {
          // Bold formatting: **bold**
          const boldParts = line.split(/(\*\*[^*]+?\*\*)/g);

          return (
            <React.Fragment key={lIdx}>
              {boldParts.map((bPart, bIdx) => {
                if (bPart.startsWith('**') && bPart.endsWith('**')) {
                  return (
                    <strong key={bIdx} className="font-extrabold text-slate-950">
                      {bPart.slice(2, -2)}
                    </strong>
                  );
                }
                return <span key={bIdx}>{bPart}</span>;
              })}
              {/* Har Enter ke bad line break lagayein */}
              {lIdx < lines.length - 1 && <br />}
            </React.Fragment>
          );
        })}
      </span>
    );
  };

  // 3. Agar string mein $ ya $$ hai (Standard LaTeX Parsing)
  if (cleanText.includes('$')) {
    const parts = cleanText.split(/(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g);

    return (
      <div className={`leading-[2.2] text-slate-900 ${className}`}>
        {parts.map((part, idx) => {
          if (!part) return null;

          // Block Math: $$ ... $$ (UPSC Paper Style Centered Display)
          if (part.startsWith('$$') && part.endsWith('$$')) {
            const math = part.slice(2, -2).trim();
            return (
              <div key={idx} className="my-3 py-1 overflow-x-auto text-center">
                <BlockMath math={math} errorColor="#ef4444" />
              </div>
            );
          }

          // Inline Math: $ ... $ (Text ke sath bilkul barabar align)
          if (part.startsWith('$') && part.endsWith('$')) {
            const math = part.slice(1, -1).trim();
            return (
              <span key={idx} className="inline-block mx-0.5 align-baseline">
                <InlineMath math={math} errorColor="#ef4444" />
              </span>
            );
          }

          // Plain text with bold and newline support
          return renderTextWithFormatting(part, idx);
        })}
      </div>
    );
  }

  // 4. Fallback: Agar kisi purane question mein $ na ho aur poora text ek formula ho
  const trimmed = cleanText.trim();
  const hasMultipleWords = /[\u0900-\u097F]/.test(trimmed) || /[a-zA-Z]{3,}\s+[a-zA-Z]{3,}/.test(trimmed);

  if (!hasMultipleWords && trimmed.includes('\\')) {
    return (
      <span className={`inline-block mx-0.5 align-baseline ${className}`}>
        <InlineMath math={trimmed} renderError={() => <span>{trimmed}</span>} />
      </span>
    );
  }

  // 5. Normal text with line breaks
  return (
    <div className={`leading-[2.2] text-slate-900 ${className}`}>
      {renderTextWithFormatting(cleanText, 'plain-root')}
    </div>
  );
}