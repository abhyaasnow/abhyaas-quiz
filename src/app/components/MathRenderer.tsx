'use client';

import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  text: string;
  className?: string;
}

export default function MathRenderer({ text, className = '' }: MathRendererProps) {
  if (!text) return null;

  const renderContent = (inputStr: string) => {
    try {
      // 1. Render Block Math $$...$$
      let processed = inputStr.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
        try {
          return `<div class="my-3 overflow-x-auto text-center">${katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })}</div>`;
        } catch {
          return `$$${math}$$`;
        }
      });

      // 2. Render Inline Math $...$
      processed = processed.replace(/\$([\s\S]*?)\$/g, (_, math) => {
        try {
          return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
        } catch {
          return `$${math}$`;
        }
      });

      return processed;
    } catch {
      return inputStr;
    }
  };

  const htmlContent = renderContent(text);

  return (
    <div 
      className={`inline-block leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent.replace(/\n/g, '<br />') }} 
    />
  );
}