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

  // 1. Clean up characters & symbols
  let cleanText = text
    .replace(/\\le\s+ft/g, '\\left')
    .replace(/\\ri\s+ght/g, '\\right')
    .replace(/→/g, '\\to ')
    .replace(/←/g, '\\leftarrow ')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/±/g, '\\pm ')
    .replace(/≠/g, '\\ne ')
    .replace(/∞/g, '\\infty ');

  // 2. Bold Math formatting
  cleanText = cleanText.replace(/\*\*\$([^\$]+?)\$\*\*/g, (_, math) => `$\\boldsymbol{${math.trim()}}$`);
  cleanText = cleanText.replace(/\*\*\$\$([\s\S]+?)\$\$\*\*/g, (_, math) => `$$\\boldsymbol{${math.trim()}}$$`);

  const renderInlineSegment = (segmentText: string, keyPrefix: string | number) => {
    // Check for inline image tags: [img url=... w=250 align=center]
    const imgRegex = /(\[img\s+url=([^\]\s]+)(?:\s+w=([0-9%px]+))?(?:\s+align=([a-z]+))?\])/g;
    const parts = segmentText.split(imgRegex);

    if (parts.length > 1) {
      const elements: React.ReactNode[] = [];
      let i = 0;
      while (i < parts.length) {
        if (parts[i] && parts[i].startsWith('[img')) {
          const rawUrl = parts[i + 1];
          const widthVal = parts[i + 2] || 'auto';
          const alignVal = parts[i + 3] || 'center';

          const alignClass = 
            alignVal === 'left' ? 'mr-auto block my-2 text-left' :
            alignVal === 'right' ? 'ml-auto block my-2 text-right' :
            'mx-auto block my-3 text-center';

          elements.push(
            <span key={`${keyPrefix}-img-${i}`} className={alignClass}>
              <img
                src={rawUrl}
                alt="Equation Diagram"
                referrerPolicy="no-referrer"
                style={{ maxWidth: '100%', width: widthVal.includes('%') || widthVal.includes('px') ? widthVal : `${widthVal}px` }}
                className="inline-block rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs object-contain"
              />
            </span>
          );
          i += 4;
        } else {
          if (parts[i]) {
            elements.push(<MathJax dynamic key={`${keyPrefix}-txt-${i}`}>{parts[i]}</MathJax>);
          }
          i += 1;
        }
      }
      return <>{elements}</>;
    }

    return <MathJax dynamic>{segmentText}</MathJax>;
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