import { useKaTeX } from '../hooks/useKaTeX.js';
import { latexNum } from '../utils/math.js';

/**
 * Discrete PMF/CDF table with per-row checkboxes.
 */
export function PmfTable({
  cache, selectedXs, selectedTotal, page,
  onSelect, onClear, onInvert, onPopout,
  collapsed, onToggle, isPopup = false,
}) {
  const katexRef = useKaTeX([cache, selectedTotal, collapsed, isPopup]);
  const varSym = page?.variableSymbol || 'X';
  const valSym = page?.valueSymbol    || 'x';
  const { xs, pmf, cdf, tailInfo } = cache;

  if (isPopup) {
    return (
      <PmfTableBody
        xs={xs} pmf={pmf} cdf={cdf} tailInfo={tailInfo}
        selectedXs={selectedXs} selectedTotal={selectedTotal}
        varSym={varSym} valSym={valSym}
        onSelect={onSelect}
        isPopup={true}
        tableRef={katexRef}
      />
    );
  }

  return (
    <div className="card table-card">
      <div className="table-head">
        <div className="table-head-left">
          <span className="sec-label">PMF / CDF Table</span>
          <button className="collapse-btn" type="button" aria-expanded={!collapsed} onClick={onToggle}>
            {collapsed ? '+' : '−'}
          </button>
        </div>
        {!collapsed && (
          <div className="table-head-right">
            <button className="mini-btn" type="button" onClick={onClear}>Clear</button>
            <button className="mini-btn" type="button" onClick={onInvert}>Invert</button>
            <button className="mini-btn zoom-toggle-btn" type="button" onClick={onPopout}>Pop out ↗</button>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="table-scroll">
          <PmfTableBody
            xs={xs} pmf={pmf} cdf={cdf} tailInfo={tailInfo}
            selectedXs={selectedXs} selectedTotal={selectedTotal}
            varSym={varSym} valSym={valSym}
            onSelect={onSelect}
            isPopup={false}
            tableRef={katexRef}
          />
        </div>
      )}
      {!collapsed && tailInfo?.truncated && (
        <TruncNote message={tailInfo.message} />
      )}
    </div>
  );
}

function TruncNote({ message }) {
  const ref = useKaTeX([message]);
  return (
    <div className="trunc-note" ref={ref} dangerouslySetInnerHTML={{ __html: message }} />
  );
}

function PmfTableBody({ xs, pmf, cdf, tailInfo, selectedXs, selectedTotal, varSym, valSym, onSelect, isPopup, tableRef }) {
  const tableClass = isPopup ? 'pmf-popup-table' : 'pmf-table';

  return (
    <table className={tableClass} ref={tableRef}>
      <thead>
        <tr>
          <th>{'$' + valSym + '$'}</th>
          <th></th>
          <th>{'$P(' + varSym + '=' + valSym + ')$'}</th>
          <th>{'$P(' + varSym + '\\le ' + valSym + ')$'}</th>
        </tr>
      </thead>
      <tbody>
        {xs.map((x, i) => (
          <tr key={x}>
            <td>{'$' + x + '$'}</td>
            <td>
              <label className="pmf-check-cell">
                <input
                  type="checkbox"
                  checked={selectedXs.has(x)}
                  onChange={e => onSelect(x, e.target.checked)}
                />
              </label>
            </td>
            <td className="output-cell">{'$' + latexNum(pmf[i], 4) + '$'}</td>
            <td className="output-cell">{'$' + latexNum(cdf[i], 4) + '$'}</td>
          </tr>
        ))}
        {tailInfo?.truncated && (
          <tr>
            <td>$\cdots$</td>
            <td></td>
            <td className="output-cell">$\cdots$</td>
            <td className="output-cell">
              {'$F(' + valSym + ')\\approx ' + latexNum(tailInfo.cdfAtMax, 4) + '$'}
            </td>
          </tr>
        )}
        <tr className="total-row">
          <td className="total-label">selected prob</td>
          <td></td>
          <td className="output-cell">{'$' + latexNum(selectedTotal, 4) + '$'}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  );
}
