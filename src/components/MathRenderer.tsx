'use client';

import React from 'react';
import { MathJaxContext, MathJax } from 'better-react-mathjax';

interface MathRendererProps {
  text?: string;
  className?: string;
}

const mathJaxConfig = {
  loader: { load: ['input/tex', 'output/chtml'] },
  tex: {
    inlineMath: [['$', '$']],
    displayMath: [['$$', '$$']],
    processEscapes: true,
  },
  chtml: {
    scale: 1.05,
    matchFontHeight: true,
  },
};

export default function MathRenderer({ text = '', className = '' }: MathRendererProps) {
  if (!text || typeof text !== 'string') return null;

  // 1. Symbol & LaTeX Cleanup
  let cleanText = text
    .replace(/\\le\s+ft/g, '\\left')
    .replace(/\\ri\s+ght/g, '\\right')
    .replace(/→/g, '\\to ')
    .replace(/←/g, '\\leftarrow ')
    .replace(/↔/g, '\\leftrightarrow ')
    .replace(/⇒/g, '\\implies ')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/±/g, '\\pm ')
    .replace(/≠/g, '\\ne ')
    .replace(/×/g, '\\times ')
    .replace(/÷/g, '\\div ')
    .replace(/∞/g, '\\infty ');

  // 2. Bold Math formatting
  cleanText = cleanText.replace(/\*\*\$([^\$]+?)\$\*\*/g, (_, math) => `$\\boldsymbol{${math.trim()}}$`);
  cleanText = cleanText.replace(/\*\*\$\$([\s\S]+?)\$\$\*\*/g, (_, math) => `$$\\boldsymbol{${math.trim()}}$$`);

  const renderInlineSegment = (segmentText: string, lineKey: string | number) => {
    // Robust regex handling quoted URLs, unquoted URLs, data-URIs, optional width and alignment
    const imgRegex = /\[img\s+url=(?:["']([^"']+)["']|([^\s\]]+))(?:\s+w=([0-9%px]+))?(?:\s+align=([a-z]+))?\]/gi;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = imgRegex.exec(segmentText)) !== null) {
      // Math/Text before the tag
      if (match.index > lastIndex) {
        const textBefore = segmentText.substring(lastIndex, match.index);
        if (textBefore) {
          parts.push(
            <MathJax dynamic key={`${lineKey}-txt-${lastIndex}`}>
              {textBefore}
            </MathJax>
          );
        }
      }

      const rawUrl = match[1] || match[2] || '';
      const widthVal = match[3] || 'auto';
      const alignVal = (match[4] || 'center').toLowerCase();

      const alignClass =
        alignVal === 'left'
          ? 'mr-auto block my-2 text-left'
          : alignVal === 'right'
          ? 'ml-auto block my-2 text-right'
          : 'mx-auto block my-3 text-center';

      parts.push(
        <span key={`${lineKey}-img-${match.index}`} className={alignClass}>
          <img
            src={rawUrl}
            alt="Diagram"
            referrerPolicy="no-referrer"
            style={{
              maxWidth: '100%',
              width: widthVal.includes('%') || widthVal.includes('px') ? widthVal : `${widthVal}px`,
            }}
            className="inline-block rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs object-contain"
          />
        </span>
      );

      lastIndex = imgRegex.lastIndex;
    }

    // Remaining text after the last tag
    if (lastIndex < segmentText.length) {
      const remainingText = segmentText.substring(lastIndex);
      if (remainingText) {
        parts.push(
          <MathJax dynamic key={`${lineKey}-txt-${lastIndex}`}>
            {remainingText}
          </MathJax>
        );
      }
    }

    return parts.length > 0 ? <>{parts}</> : <MathJax dynamic>{segmentText}</MathJax>;
  };

  const lines = cleanText.split('\n');

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className={`font-sans leading-[2.2] text-slate-900 overflow-visible ${className}`}>
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={lIdx} className="h-3" />;

          return (
            <div key={lIdx} className="my-1.5 overflow-visible">
              {renderInlineSegment(line, lIdx)}
            </div>
          );
        })}
      </div>
    </MathJaxContext>
  );
}