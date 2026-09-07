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

  // 1. अगर फॉर्मूले में \le ft जैसी विकृति आ गई हो, तो उसे ठीक करें
  let cleanText = text
    .replace(/\\le\s+ft/g, '\\left')
    .replace(/\\ri\s+ght/g, '\\right');

  // 2. अगर टेक्स्ट में स्पष्ट रूप से $...$ या $$...$$ मौजूद हैं
  if (cleanText.includes('$')) {
    const parts = cleanText.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);
    return (
      <span className={`inline-block max-w-full align-middle ${className}`}>
        {parts.map((part, idx) => {
          if (!part) return null;
          if (part.startsWith('$$') && part.endsWith('$$')) {
            return <BlockMath key={idx} math={part.slice(2, -2).trim()} errorColor="#e11d48" />;
          }
          if (part.startsWith('$') && part.endsWith('$')) {
            return <InlineMath key={idx} math={part.slice(1, -1).trim()} errorColor="#e11d48" />;
          }
          return <span key={idx}>{part}</span>;
        })}
      </span>
    );
  }

  // 3. अगर टेक्स्ट में $ नहीं है, लेकिन केवल एक शुद्ध फ़ॉर्मूला है (जैसे ऑप्शन्स में \frac{...}{...})
  const isPureFormula = /^(\\[a-zA-Z]+|[0-9\s\+\-\*\/\(\)\^\{\}\_]|[a-zA-Z]\s*=)+$/.test(cleanText.trim()) && cleanText.includes('\\');
  if (isPureFormula) {
    return (
      <span className={`inline-block align-middle ${className}`}>
        <InlineMath math={cleanText.trim()} renderError={() => <span>{cleanText}</span>} />
      </span>
    );
  }

  // 4. अगर वाक्य और फ़ॉर्मूला दोनों मिले हुए हैं (बिना $ के), तो \int, \frac आदि को अलग से रेंडर करें
  const mixedParts = cleanText.split(/([A-Za-z0-9_]*\s*=\s*\\[\s\S]+|\\[a-zA-Z]+(?:\{[^{}]*\}|\[[^\[\]]*\]|[a-zA-Z0-9_\^]+)*)/g);
  return (
    <span className={`inline-block max-w-full align-middle ${className}`}>
      {mixedParts.map((segment, idx) => {
        if (!segment) return null;
        if (segment.includes('\\')) {
          return (
            <span key={idx} className="inline-block mx-0.5">
              <InlineMath math={segment.trim()} renderError={() => <span>{segment}</span>} />
            </span>
          );
        }
        return <span key={idx}>{segment}</span>;
      })}
    </span>
  );
}