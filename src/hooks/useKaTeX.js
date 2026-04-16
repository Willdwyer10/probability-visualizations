import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
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
  ignoredClasses: ['katex', 'no-math'],
};

/**
 * Attach this ref to a container element to auto-render KaTeX inside it.
 * Highly robust: renders immediately on mount/update and watches for DOM mutations.
 */
export function useKaTeX(deps = []) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !renderMathInElement) return;

    const render = () => {
      // Standard KaTeX auto-render call
      renderMathInElement(el, KATEX_OPTIONS);
    };

    // 1. Immediate render after React commit
    render();

    // 2. Secondary render after a short delay (safety net for font loading/layout shifts)
    const timer = setTimeout(render, 250);

    // 3. MutationObserver to handle dynamic content (e.g. dangerouslySetInnerHTML)
    // that might change between React render cycles or via external scripts.
    const observer = new MutationObserver((mutations) => {
      // Prevent infinite loops by ignoring mutations caused by KaTeX itself
      const isInternal = mutations.some(m => {
        const t = m.target;
        return t.classList?.contains('katex') || t.closest?.('.katex');
      });
      if (isInternal) return;

      render();
    });

    observer.observe(el, { childList: true, subtree: true, characterData: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
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
    if (el && renderMathInElement) {
      renderMathInElement(el, KATEX_OPTIONS);
    }
  }, []);
}
