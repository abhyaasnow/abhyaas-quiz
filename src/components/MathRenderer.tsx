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

  // 2. Math-Bolding Support: Automatically convert **$...$** to $\boldsymbol{...}$
  cleanText = cleanText.replace(/\*\*\$([^\$]+?)\$\*\*/g, (_, math) => `$\\boldsymbol{${math.trim()}}$`);
  cleanText = cleanText.replace(/\*\*\$\$([\s\S]+?)\$\$\*\*/g, (_, math) => `$$\\boldsymbol{${math.trim()}}$$`);

  // Helper to render inline text with Bold, Italics, Colors, and Underlines
  const renderInlineFormatted = (rawStr: string, keyPrefix: string | number) => {
    // Check for color tags: [color=red]...[/color]
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

          // Markdown Bold: **text**
          const boldTokens = cToken.split(/(\*\*[^*]+?\*\*)/g);
          return boldTokens.map((bToken, bIdx) => {
            if (bToken.startsWith('**') && bToken.endsWith('**')) {
              return (
                <strong key={bIdx} className="font-extrabold text-slate-950">
                  {bToken.slice(2, -2)}
                </strong>
              );
            }

            // Markdown Italic: *text*
            const italicTokens = bToken.split(/(\*[^*]+?\*)/g);
            return italicTokens.map((iToken, iIdx) => {
              if (iToken.startsWith('*') && iToken.endsWith('*') && iToken.length > 2) {
                return <em key={iIdx} className="italic">{iToken.slice(1, -1)}</em>;
              }

              // Underline: <u>text</u>
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

  // Helper to render parsed paragraphs, lists, alignments, and math
  const renderBlockContent = (content: string, blockKey: string | number) => {
    // Split into math parts ($$...$$ and $...$)
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g);

    return parts.map((part, pIdx) => {
      if (!part) return null;

      // Block Math ($$...$$) -> UPSC Padded Display
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2).trim();
        return (
          <div key={`${blockKey}-${pIdx}`} className="my-3.5 py-1.5 overflow-x-auto text-center w-full">
            <BlockMath math={math} errorColor="#ef4444" />
          </div>
        );
      }

      // Inline Math ($...$) -> Baseline Aligned
      if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1).trim();
        return (
          <span key={`${blockKey}-${pIdx}`} className="inline-block mx-0.5 align-baseline">
            <InlineMath math={math} errorColor="#ef4444" />
          </span>
        );
      }

      // Prose Text
      return renderInlineFormatted(part, `${blockKey}-${pIdx}`);
    });
  };

  // 3. Process structural blocks (Alignment tags & Newline lists)
  const lines = cleanText.split('\n');

  return (
    <div className={`font-sans leading-[2.4] text-slate-900 ${className}`}>
      {/* Scoped CSS to optimize fraction clearance and prevent power clipping */}
      <style>{`
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

      // Block Math ($$...$$) -> Strict UPSC Display Box with Safe Margins
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2).trim();
        return (
          <div key={`${blockKey}-${pIdx}`} className="my-5 py-3 px-2 overflow-x-auto text-center w-full block-math-container">
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
    <div className={`font-sans leading-[2.6] text-slate-900 ${className}`}>
      {/* Bulletproof Global KaTeX Layout & Spacing Engine */}
      <style>{`
        .katex-display {
          display: block !important;
          margin: 1.5rem 0 !important;
          padding: 0.5rem 0 !important;
          overflow-x: auto !important;
          overflow-y: visible !important;
        }
        .katex {
          font-size: 1.1em !important;
          text-rendering: optimizeLegibility !important;
        }
        /* Nominator aur Denominator ke beech safe vertical distance */
        .katex .mfrac {
          padding: 0.15em 0 !important;
        }
        .katex .mfrac > span > span {
          padding-bottom: 0.12em !important;
          padding-top: 0.12em !important;
        }
        .katex .mfrac .frac-line {
          border-bottom-width: 1.5px !important;
          border-color: currentColor !important;
        }
        /* Powers (exponents) aur limits ke liye extra breathing room */
        .katex .mord, .katex .mop {
          padding-left: 0.03em;
          padding-right: 0.03em;
        }
      `}</style>

      {lines.map((line, lIdx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={lIdx} className="h-3" />;
        }

        if (trimmed.startsWith('[center]') && trimmed.endsWith('[/center]')) {
          const inner = trimmed.slice(8, -9);
          return (
            <div key={lIdx} className="text-center my-3 w-full">
              {renderBlockContent(inner, lIdx)}
            </div>
          );
        }

        if (trimmed.startsWith('[right]') && trimmed.endsWith('[/right]')) {
          const inner = trimmed.slice(7, -8);
          return (
            <div key={lIdx} className="text-right my-2 w-full">
              {renderBlockContent(inner, lIdx)}
            </div>
          );
        }

        if (/^([•*-]\s+)/.test(trimmed)) {
          const bulletText = trimmed.replace(/^([•*-]\s+)/, '');
          return (
            <div key={lIdx} className="flex items-start gap-2.5 my-1.5 pl-2">
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
            <div key={lIdx} className="flex items-start gap-2 my-1.5 pl-1">
              <span className="font-extrabold text-slate-900 select-none text-xs leading-relaxed">{stepPrefix}</span>
              <div className="flex-1">
                {renderBlockContent(stepText, lIdx)}
              </div>
            </div>
          );
        }

        return (
          <div key={lIdx} className="min-h-[1.6em] my-1">
            {renderBlockContent(line, lIdx)}
          </div>
        );
      })}
    </div>
  );
}
      `}</style>

      {lines.map((line, lIdx) => {
        const trimmed = line.trim();

        // Empty line -> Spacing between paragraphs
        if (!trimmed) {
          return <div key={lIdx} className="h-2" />;
        }

        // Center alignment tag: [center]...[/center]
        if (trimmed.startsWith('[center]') && trimmed.endsWith('[/center]')) {
          const inner = trimmed.slice(8, -9);
          return (
            <div key={lIdx} className="text-center my-2 w-full">
              {renderBlockContent(inner, lIdx)}
            </div>
          );
        }

        // Right alignment tag: [right]...[/right]
        if (trimmed.startsWith('[right]') && trimmed.endsWith('[/right]')) {
          const inner = trimmed.slice(7, -8);
          return (
            <div key={lIdx} className="text-right my-1.5 w-full">
              {renderBlockContent(inner, lIdx)}
            </div>
          );
        }

        // Bullet points: • or * or -
        if (/^([•*-]\s+)/.test(trimmed)) {
          const bulletText = trimmed.replace(/^([•*-]\s+)/, '');
          return (
            <div key={lIdx} className="flex items-start gap-2.5 my-1 pl-2">
              <span className="text-blue-600 font-bold select-none text-base leading-tight">•</span>
              <div className="flex-1">
                {renderBlockContent(bulletText, lIdx)}
              </div>
            </div>
          );
        }

        // Numbered steps: 1. or 2.
        const numMatch = trimmed.match(/^(\d+[\.\)]\s+)/);
        if (numMatch) {
          const stepPrefix = numMatch[1];
          const stepText = trimmed.slice(stepPrefix.length);
          return (
            <div key={lIdx} className="flex items-start gap-2 my-1 pl-1">
              <span className="font-extrabold text-slate-900 select-none text-xs leading-relaxed">{stepPrefix}</span>
              <div className="flex-1">
                {renderBlockContent(stepText, lIdx)}
              </div>
            </div>
          );
        }

        // Standard paragraph line
        return (
          <div key={lIdx} className="min-h-[1.5em]">
            {renderBlockContent(line, lIdx)}
          </div>
        );
      })}
    </div>
  );
}