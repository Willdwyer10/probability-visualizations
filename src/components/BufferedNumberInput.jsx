import { useState, useEffect, useCallback } from 'react';

/**
 * A number input that buffers keystrokes and only commits (via onCommit)
 * when the user presses Enter or clicks outside (Blur).
 */
export function BufferedNumberInput({ 
  value, 
  onCommit, 
  min, 
  max, 
  step, 
  displayFormatter,
  className,
  id
}) {
  const [buffer, setBuffer] = useState('');

  // Sync with external value changes (e.g. from a slider)
  useEffect(() => {
    if (value === null || value === undefined || !Number.isFinite(value)) {
      setBuffer('');
      return;
    }
    const valStr = displayFormatter ? displayFormatter(value) : String(value);
    setBuffer(valStr);
  }, [value, displayFormatter]);

  const commit = useCallback(() => {
    const parsed = parseFloat(buffer);
    if (!Number.isFinite(parsed)) {
      // Revert if invalid
      if (value === null || value === undefined || !Number.isFinite(value)) {
        setBuffer('');
      } else {
        const valStr = displayFormatter ? displayFormatter(value) : String(value);
        setBuffer(valStr);
      }
      return;
    }
    onCommit(parsed);
  }, [buffer, value, onCommit, displayFormatter]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
      e.target.blur();
    }
  };

  return (
    <input
      type="number"
      id={id}
      className={className}
      min={min}
      max={max}
      step={step}
      value={buffer}
      onChange={e => setBuffer(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
    />
  );
}
