'use client';

import React from 'react';
import { MathJaxContext, MathJax } from 'better-react-mathjax';

interface MathRendererProps {
  text?: string;
  className?: string;
}

const mathJaxConfig = {
  loader: { load: ['[tex]/ams'] },
  tex: {
    packages: { '[+]': ['ams'] },
    inlineMath: [['$', '$']],
    displayMath: [['$$', '$$']],
  },
  chtml: {
    fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2',
  },
};

export default function MathRenderer({ text = '', className = '' }: MathRendererProps) {
  if (!text || typeof text !== 'string') return null;

  // Symbol Cleanup
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

  // Bold Math formatting
  cleanText = cleanText.replace(/\*\*\$([^\$]+?)\$\*\*/g, (_, math) => `$\\boldsymbol{${math.trim()}}$`);
  cleanText = cleanText.replace(/\*\*\$\$([\s\S]+?)\$\$\*\*/g, (_, math) => `$$\\boldsymbol{${math.trim()}}$$`);

  const lines = cleanText.split('\n');

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className={`font-sans leading-relaxed text-slate-900 ${className}`}>
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={lIdx} className="h-3" />;

          return (
            <div key={lIdx} className="my-1.5">
              <MathJax dynamic>{line}</MathJax>
            </div>
          );
        })}
      </div>
    </MathJaxContext>
  );
}