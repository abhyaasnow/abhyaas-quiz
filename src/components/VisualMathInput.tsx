'use client';

import React, { useEffect, useRef } from 'react';

interface VisualMathInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export default function VisualMathInput({
  value,
  onChange,
  placeholder = 'Type equation visually here...',
  className = ''
}: VisualMathInputProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mathfieldRef = useRef<any>(null);

  useEffect(() => {
    let mf: any = null;

    // MathLive वेब कंपोनेंट को डायनामिकली लोड करना
    import('mathlive').then(() => {
      if (!containerRef.current) return;

      // अगर पहले से नहीं बना है तो Mathfield एलिमेंट बनाएँ
      if (!mathfieldRef.current) {
        mf = document.createElement('math-field') as any;
        mf.style.width = '100%';
        mf.style.padding = '8px 12px';
        mf.style.borderRadius = '12px';
        mf.style.border = '1px solid #cbd5e1';
        mf.style.backgroundColor = '#ffffff';
        mf.style.fontSize = '16px';
        mf.style.outline = 'none';

        // वर्चुअल कीबोर्ड और सेटिंग्स
        mf.setOptions({
          virtualKeyboardMode: 'onfocus',
          defaultMode: 'math',
        });

        mf.value = value || '';

        // जब यूजर टाइप करे तो वैल्यू अपडेट हो
        mf.addEventListener('input', (e: any) => {
          onChange(e.target.value);
        });

        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(mf);
        mathfieldRef.current = mf;
      }
    });

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      mathfieldRef.current = null;
    };
  }, []);

  // जब बाहर से वैल्यू बदले तो फील्ड को सिंक रखें
  useEffect(() => {
    if (mathfieldRef.current && mathfieldRef.current.value !== value) {
      mathfieldRef.current.value = value || '';
    }
  }, [value]);

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      <div ref={containerRef} className="w-full" />
      <p className="text-[10px] text-slate-400">
        💡 विज़ुअल बॉक्स पर क्लिक करते ही नीचे गणितीय कीबोर्ड (फ़्रैक्शन, रूट, पावर्स) खुल जाएगा।
      </p>
    </div>
  );
}