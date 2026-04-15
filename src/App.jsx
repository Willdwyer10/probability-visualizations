import './App.css';
import 'katex/dist/katex.min.css';

import { useState, useCallback } from 'react';
import { useUrlRoute } from './hooks/useUrlRoute.js';
import { useKaTeX } from './hooks/useKaTeX.js';
import { MASTER_GROUPS } from './distributions/index.js';
import { DistributionSelector } from './components/DistributionSelector.jsx';
import { VersionTabs } from './components/VersionTabs.jsx';
import { DiscreteView } from './components/DiscreteView.jsx';
import { ContinuousView } from './components/ContinuousView.jsx';
import { SpecialView } from './components/SpecialView.jsx';
import { WalkthroughDemoButton } from './components/WalkthroughDemo.jsx';

function HelpModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">How to Use</span>
          <button className="modal-close" type="button" onClick={onClose}>Close</button>
        </div>
        <div className="modal-body">
          <h4>Distribution Explorer</h4>
          <p>
            Select a distribution from the dropdown menu. Adjust its parameters using the sliders or number inputs on the left panel.
          </p>
          <ul>
            <li><b>PMF/PDF chart:</b> Shows the probability mass or density function. Selected bars contribute to the total probability shown.</li>
            <li><b>CDF overlay:</b> Shows the cumulative distribution function as a step/continuous curve.</li>
            <li><b>Calculator:</b> Compute P(X &le; x), P(X &ge; x), or P(c&#8321; &le; X &le; c&#8322;). Drag handles on the chart to move cutoff values.</li>
            <li><b>Fixed axes:</b> Locking the x/y axis prevents rescaling when parameters change.</li>
            <li><b>URL routing:</b> The URL updates with each distribution (#group=...&amp;tab=...), so links are shareable.</li>
          </ul>
          <p>
            Distributions marked <em>"with 2 tabs"</em> or <em>"with 2 versions"</em> have multiple parameterizations—use the tabs in the header to switch between them.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Compute title HTML from default params (used as initial value before live updates). */
function getDefaultTitleHtml(group, tabIndex) {
  if (!group) return '';
  const engine = group.engine ?? 'discrete';
  const page = engine !== 'special'
    ? (group.tabs?.[tabIndex] ?? group.tabs?.[0])
    : group.special;
  if (!page) return group.label ?? '';
  const defs = page.parameters ?? page.params ?? page.inputs ?? [];
  const resolved = typeof defs === 'function' ? defs({}) : defs;
  const p = {};
  (resolved ?? []).forEach(d => { p[d.id ?? d.key] = d.value; });
  return page.display?.title?.(p) ?? page.label ?? group.label ?? '';
}

export default function App() {
  const { groupKey, tabIndex, setRoute } = useUrlRoute();
  const [showHelp, setShowHelp] = useState(false);

  const group = MASTER_GROUPS[groupKey];
  const engine = group?.engine ?? 'discrete';

  // Resolve tabs for tab bar
  const tabs = engine !== 'special' ? (group?.tabs ?? []) : [];
  const currKey = groupKey + ':' + tabIndex;

  // Live title state — starts from default params, updated live by view components via onTitleChange.
  // View components remount (key={currKey}) on distribution change and fire useEffect to reset title.
  const [titleHtml, setTitleHtml] = useState(() => getDefaultTitleHtml(group, tabIndex));

  const titleRef = useKaTeX([titleHtml]);

  const [showCopyright, setShowCopyright] = useState(false);

  // Callback for view components to push live title updates when params change
  const onTitleChange = useCallback((html) => {
    setTitleHtml(html);
  }, []);

  // When group changes → reset tab to 0
  const onGroupSelect = useCallback((key) => {
    setRoute(key, 0, true);
  }, [setRoute]);

  const onTabChange = useCallback((i) => {
    setRoute(groupKey, i, true);
  }, [groupKey, setRoute]);

  return (
    <>
      {/* ── Header ── */}
      <header className="page-head" role="banner">
        <div className="head-row">
          <div className="page-title" ref={titleRef}>
            <div dangerouslySetInnerHTML={{ __html: titleHtml }} />
          </div>
          <div className="head-actions">
            {tabs.length > 1 && (
              <VersionTabs
                tabs={tabs}
                current={tabIndex}
                onChange={onTabChange}
              />
            )}
            <WalkthroughDemoButton />
            <button className="header-mini-btn" type="button" onClick={() => setShowHelp(true)}>Help</button>
            <button className="header-mini-btn" style={{ padding: '3px 6px' }} type="button" onClick={() => setShowCopyright(true)}>©</button>
          </div>
        </div>
      </header>

      {/* ── Main view ── */}
      <div className="wrap">
        {engine === 'discrete'   && <DiscreteView   key={currKey} groupKey={groupKey} tabIndex={tabIndex} onTitleChange={onTitleChange} onGroupSelect={onGroupSelect} />}
        {engine === 'continuous' && <ContinuousView key={currKey} groupKey={groupKey} tabIndex={tabIndex} onTitleChange={onTitleChange} onGroupSelect={onGroupSelect} />}
        {engine === 'special'    && <SpecialView    key={groupKey}                    groupKey={groupKey} onTitleChange={onTitleChange} onGroupSelect={onGroupSelect} />}
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      
      {showCopyright && (
        <div className="modal-overlay" onClick={() => setShowCopyright(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Copyright and acknowledgments</span>
              <button className="modal-close" type="button" onClick={() => setShowCopyright(false)}>Close</button>
            </div>
            <div className="modal-body">
              <p><b>Unified Distribution Explorer</b> integrates the original Discrete Distribution Explorer, Continuous Distribution Explorer, and selected special function pages for teaching and demonstration.</p>
              <p>© 2026 Dr. Bo Yang (杨博), Department of Statistics, UW-Madison.</p>
              <p>This tool is intended for teaching, learning, and reproducible comparison with standard R functions.</p>
              <p>Special thanks to my students, Qingzhe Zhu (朱庆泽) and William Dwyer, whose implementation work, feedback, and testing helped improve the interface, explanations, and computational checks.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
