import { useKaTeX } from '../hooks/useKaTeX.js';
import { ensureTrailingColon } from '../utils/math.js';

/** Renders the properties table for either discrete or continuous pages. */
export function PropertiesTable({ page, params, collapsed, onToggle }) {
  // Resolve properties array — discrete uses `properties`, continuous uses `props`
  const rawProps = page?.properties ?? page?.props;
  const props = typeof rawProps === 'function' ? rawProps(params) : (rawProps || []);

  const katexRef = useKaTeX([props, collapsed]);

  return (
    <div className="card">
      <div className="section-head">
        <span className="sec-label">Properties</span>
        <button
          className="collapse-btn"
          type="button"
          aria-expanded={!collapsed}
          onClick={onToggle}
        >
          {collapsed ? '+' : '−'}
        </button>
      </div>

      {!collapsed && (
        <table className="prop-table" ref={katexRef}>
          <tbody>
            {props.map((prop, i) => {
              const formula = typeof prop.formula === 'function' ? prop.formula(params) : (prop.formula || '');
              const value   = typeof prop.value   === 'function' ? prop.value(params)   : (prop.value || '');
              const showVal = !!String(value || '').trim();
              return (
                <tr key={prop.id || i}>
                  <td><b>{ensureTrailingColon(prop.label || '')}</b></td>
                  <td dangerouslySetInnerHTML={{ __html: formula }} />
                  <td>
                    {showVal && (
                      <div
                        className="result-val"
                        dangerouslySetInnerHTML={{ __html: value }}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
