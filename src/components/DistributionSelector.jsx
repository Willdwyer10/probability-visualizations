import { useRef, useEffect, useState } from 'react';
import { MASTER_GROUPS, MASTER_ORDER } from '../distributions/index.js';

export function DistributionSelector({ groupKey, onSelect }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const label = MASTER_GROUPS[groupKey]?.label ?? groupKey;

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = (key) => {
    setOpen(false);
    if (key !== groupKey) onSelect(key);
  };

  return (
    <div className="dist-dropdown-wrap" ref={wrapRef}>
      <button
        className="dist-dropdown-btn"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span className="dist-dropdown-btn-text">{label}</span>
        <span className="dist-dropdown-arrow">▼</span>
      </button>

      {open && (
        <div className="dist-dropdown-list" role="listbox">
          {MASTER_ORDER.map(cat => (
            <div key={cat.category}>
              <div className="dist-dropdown-group-label">{cat.category}</div>
              {cat.keys.map(key => (
                <button
                  key={key}
                  className={`dist-dropdown-item${key === groupKey ? ' selected' : ''}`}
                  role="option"
                  aria-selected={key === groupKey}
                  type="button"
                  onClick={() => handleSelect(key)}
                >
                  {MASTER_GROUPS[key]?.label ?? key}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
