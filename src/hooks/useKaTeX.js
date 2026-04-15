import { useEffect, useRef, useCallback } from 'react';
import autoRender from 'katex/contrib/auto-render';

const renderMathInElement = (typeof autoRender === 'function') 
  ? autoRender 
  : (autoRender && autoRender.default ? autoRender.default : null);

const KATEX_OPTIONS = {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '$',  right: '$',  display: false },
  ],
  throwOnError: false,
  strict: 'ignore',
  ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
  ignoredClasses: ['katex'],
};

/**
 * Attach this ref to a container element to auto-render KaTeX inside it.
 * Re-runs whenever `deps` change.
 */
export function useKaTeX(deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    let handle;
    if (ref.current && renderMathInElement) {
      handle = setTimeout(() => {
        if (ref.current) renderMathInElement(ref.current, KATEX_OPTIONS);
      }, 50);
    } else if (!renderMathInElement) {
      console.error('KaTeX auto-render not found!', autoRender);
    }
    return () => {
      clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

/**
 * Returns a stable callback function that can be called imperatively to
 * re-render KaTeX inside a given DOM element.
 */
export function useKaTeXRender() {
  return useCallback((el) => {
    if (el && renderMathInElement) renderMathInElement(el, KATEX_OPTIONS);
  }, []);
}
