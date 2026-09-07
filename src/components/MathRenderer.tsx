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

  // 1. अगर किसी पुराने डेटा में \le ft टूटा हुआ हो, तो उसे जोड़ें
  let cleanText = text
    .replace(/\\le\s+ft/g, '\\left')
    .replace(/\\ri\s+ght/g, '\\right');

  // 2. जब सवाल में $ ... $ या $$ ... $$ लगे हों (Standard Math)
  if (cleanText.includes('$')) {
    const parts = cleanText.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);
    return (
      <span className={`inline leading-relaxed ${className}`}>
        {parts.map((part, idx) => {
          if (!part) return null;

          if (part.startsWith('$$') && part.endsWith('$$')) {
            const math = part.slice(2, -2).trim();
            return (
              <span key={idx} className="block my-2 text-center overflow-x-auto">
                <BlockMath math={math} errorColor="#e11d48" />
              </span>
            );
          }

          if (part.startsWith('$') && part.endsWith('$')) {
            const math = part.slice(1, -1).trim();
            return (
              <span key={idx} className="inline-block mx-1.5 align-middle">
                <InlineMath math={math} errorColor="#e11d48" />
              </span>
            );
          }

          // साधारण टेक्स्ट: स्पेस और शब्दों को बिल्कुल सुरक्षित रखें
          return <span key={idx}>{part}</span>;
        })}
      </span>
    );
  }

  // 3. अगर $ न हो और पूरा विकल्प केवल एक फॉर्मूला हो (जैसे ऑप्शन्स: \frac{1+\sqrt{29}}{2} या \sqrt{7})
  const trimmed = cleanText.trim();
  const hasMultipleWords = /[\u0900-\u097F]/.test(trimmed) || /[a-zA-Z]{3,}\s+[a-zA-Z]{3,}/.test(trimmed);

  if (!hasMultipleWords && trimmed.includes('\\')) {
    return (
      <span className={`inline-block mx-1 align-middle ${className}`}>
        <InlineMath math={trimmed} renderError={() => <span>{trimmed}</span>} />
      </span>
    );
  }

  // 4. अगर बिना $ के वाक्य में कोई फॉर्मूला आ जाए, तो सिर्फ फॉर्मूले को पकड़ें, पूरे वाक्य को नहीं
  const strictTokenRegex = /(\\[a-zA-Z]+(?:\{[^{}]*\}|\[[^\[\]]*\])*(?:_\{\w+\}|\^\w+|_\w+|\^\{\w+\})*)/g;
  const mixedParts = cleanText.split(strictTokenRegex);

  return (
    <span className={`inline leading-relaxed ${className}`}>
      {mixedParts.map((segment, idx) => {
        if (!segment) return null;
        if (segment.startsWith('\\')) {
          return (
            <span key={idx} className="inline-block mx-1.5 align-middle">
              <InlineMath math={segment.trim()} renderError={() => <span>{segment}</span>} />
            </span>
          );
        }
        return <span key={idx}>{segment}</span>;
      })}
    </span>
  );
}