/**
 * Tab switcher shown in the header when a distribution has multiple tabs.
 * Props:
 *   tabs     — array of PAGE objects
 *   current  — current tabIndex
 *   onChange — (tabIndex) => void
 */
export function VersionTabs({ tabs, current, onChange }) {
  if (!tabs || tabs.length <= 1) return null;

  return (
    <div className="version-tabs" role="tablist">
      {tabs.map((tab, i) => (
        <button
          key={tab.id || i}
          className={`version-tab${current === i ? ' active' : ''}`}
          role="tab"
          aria-selected={current === i}
          type="button"
          onClick={() => onChange(i)}
        >
          {tab.tabShort && <span className="ver-short">{tab.tabShort}</span>}
          {tab.tabLong  && <span className="ver-long">{tab.tabLong}</span>}
        </button>
      ))}
    </div>
  );
}
