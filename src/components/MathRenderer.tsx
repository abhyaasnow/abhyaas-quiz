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

  // 1. Typography & Symbol Pre-processing
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

  // 2. Math-Bolding Support
  cleanText = cleanText.replace(/\*\*\$([^\$]+?)\$\*\*/g, (_, math) => `$\\boldsymbol{${math.trim()}}$`);
  cleanText = cleanText.replace(/\*\*\$\$([\s\S]+?)\$\$\*\*/g, (_, math) => `$$\\boldsymbol{${math.trim()}}$$`);

  const renderInlineFormatted = (rawStr: string, keyPrefix: string | number) => {
    const colorTokens = rawStr.split(/(\[color=[a-zA-Z0-9#]+\][\s\S]*?\[\/color\])/g);

    return (
      <React.Fragment key={keyPrefix}>
        {colorTokens.map((cToken, cIdx) => {
          const colorMatch = cToken.match(/^\[color=([a-zA-Z0-9#]+)\]([\s\S]*?)\[\/color\]$/);
          if (colorMatch) {
            const [, colorVal, innerText] = colorMatch;
            const colorClass = 
              colorVal === 'red' ? 'text-rose-600 font-semibold' :
              colorVal === 'blue' ? 'text-blue-600 font-semibold' :
              colorVal === 'green' ? 'text-emerald-600 font-semibold' :
              colorVal === 'amber' ? 'text-amber-600 font-semibold' :
              colorVal === 'purple' ? 'text-purple-600 font-semibold' : '';

            return (
              <span key={cIdx} className={colorClass} style={!colorClass ? { color: colorVal } : undefined}>
                {renderInlineFormatted(innerText, `${keyPrefix}-c-${cIdx}`)}
              </span>
            );
          }

          const boldTokens = cToken.split(/(\*\*[^*]+?\*\*)/g);
          return boldTokens.map((bToken, bIdx) => {
            if (bToken.startsWith('**') && bToken.endsWith('**')) {
              return (
                <strong key={bIdx} className="font-extrabold text-slate-950">
                  {bToken.slice(2, -2)}
                </strong>
              );
            }

            const italicTokens = bToken.split(/(\*[^*]+?\*)/g);
            return italicTokens.map((iToken, iIdx) => {
              if (iToken.startsWith('*') && iToken.endsWith('*') && iToken.length > 2) {
                return <em key={iIdx} className="italic">{iToken.slice(1, -1)}</em>;
              }

              if (iToken.includes('<u>') && iToken.includes('</u>')) {
                const uParts = iToken.split(/(<u>[\s\S]*?<\/u>)/g);
                return uParts.map((uP, uIdx) => {
                  if (uP.startsWith('<u>') && uP.endsWith('</u>')) {
                    return <u key={uIdx} className="underline underline-offset-2">{uP.slice(3, -4)}</u>;
                  }
                  return <span key={uIdx}>{uP}</span>;
                });
              }

              return <span key={iIdx}>{iToken}</span>;
            });
          });
        })}
      </React.Fragment>
    );
  };

  const renderBlockContent = (content: string, blockKey: string | number) => {
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g);

    return parts.map((part, pIdx) => {
      if (!part) return null;

      // Block Math ($$...$$) -> Safe Display Box with UPSC Spacing
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2).trim();
        return (
          <div key={`${blockKey}-${pIdx}`} className="my-6 py-4 px-2 overflow-x-auto text-center w-full block-math-box">
            <BlockMath math={math} errorColor="#ef4444" />
          </div>
        );
      }

      if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1).trim();
        return (
          <span key={`${blockKey}-${pIdx}`} className="inline-block mx-0.5 align-baseline">
            <InlineMath math={math} errorColor="#ef4444" />
          </span>
        );
      }

      return renderInlineFormatted(part, `${blockKey}-${pIdx}`);
    });
  };

  const lines = cleanText.split('\n');

  return (
    <div className={`font-sans leading-[2.8] text-slate-900 ${className}`}>
      {/* UPSC-Grade Precision Fraction & Typography Engine */}
      <style>{`
        .katex-display {
          display: block !important;
          margin: 2rem 0 !important;
          padding: 1rem 0 !important;
          overflow-x: auto !important;
          overflow-y: visible !important;
        }
        .katex {
          font-size: 1.15em !important;
          text-rendering: optimizeLegibility !important;
        }
        /* -- PERFECT UPSC FRACTION PADDING & NUMERATOR/DENOMINATOR GAP FIX -- */
        .katex .mfrac {
          padding: 0 0.2em !important;
        }
        .katex .mfrac .vlist-t2 {
          margin-top: 0.15em !important;
          margin-bottom: 0.15em !important;
        }
        .katex .mfrac .vlist-r > span:nth-child(1) {
          margin-bottom: -0.2em !important;
        }
        .katex .mfrac .vlist-r > span:nth-child(3) {
          margin-top: -0.15em !important;
        }
        .katex .mfrac .frac-line {
          border-bottom-width: 1.4px !important;
          border-color: currentColor !important;
          min-height: 1.4px !important;
        }
        /* Ensures superscripts (powers) have ideal vertical headroom */
        .katex .msupsub {
          text-align: left !important;
        }
      `}</style>

      {lines.map((line, lIdx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={lIdx} className="h-4" />;
        }

        if (trimmed.startsWith('[center]') && trimmed.endsWith('[/center]')) {
          const inner = trimmed.slice(8, -9);
          return (
            <div key={lIdx} className="text-center my-4 w-full">
              {renderBlockContent(inner, lIdx)}
            </div>
          );
        }

        if (trimmed.startsWith('[right]') && trimmed.endsWith('[/right]')) {
          const inner = trimmed.slice(7, -8);
          return (
            <div key={lIdx} className="text-right my-3 w-full">
              {renderBlockContent(inner, lIdx)}
            </div>
          );
        }

        if (/^([•*-]\s+)/.test(trimmed)) {
          const bulletText = trimmed.replace(/^([•*-]\s+)/, '');
          return (
            <div key={lIdx} className="flex items-start gap-2.5 my-2 pl-2">
              <span className="text-blue-600 font-bold select-none text-base leading-tight">•</span>
              <div className="flex-1">
                {renderBlockContent(bulletText, lIdx)}
              </div>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+[\.\)]\s+)/);
        if (numMatch) {
          const stepPrefix = numMatch[1];
          const stepText = trimmed.slice(stepPrefix.length);
          return (
            <div key={lIdx} className="flex items-start gap-2 my-2 pl-1">
              <span className="font-extrabold text-slate-900 select-none text-xs leading-relaxed">{stepPrefix}</span>
              <div className="flex-1">
                {renderBlockContent(stepText, lIdx)}
              </div>
            </div>
          );
        }

        return (
          <div key={lIdx} className="min-h-[1.8em] my-1.5">
            {renderBlockContent(line, lIdx)}
          </div>
        );
      })}
    </div>
  );
}