import { useState, type JSX } from 'react';

export const widgetId = 'bep';

const yen = (v: number): string => `${Math.round(v).toLocaleString('en-US')} 万円`;

/** 損益分岐点を、売上を動かしながら黒字と赤字の境目として見る道具 */
export default function BepWidget(): JSX.Element {
  const [fixed, setFixed] = useState(300);
  const [ratio, setRatio] = useState(60);
  const [sales, setSales] = useState(1000);

  const vr = ratio / 100;
  const bep = vr < 1 ? fixed / (1 - vr) : Infinity;
  const variable = sales * vr;
  const profit = sales - variable - fixed;

  // グラフ用（横軸は 0 〜 2000 万円）
  const max = 2000;
  const x = (v: number): number => (v / max) * 300;
  const y = (v: number): number => 140 - (v / max) * 140;

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">利益がゼロになる売上高を探す</h4>
        <p className="widget-desc">
          固定費と変動費率を決めると、赤字と黒字の境目が決まります。売上を動かして、どこで交わるか見てください。
        </p>
      </div>

      <div className="widget-row">
        <span className="widget-field" style={{ minWidth: '7em' }}>
          固定費
        </span>
        <input
          className="slider"
          type="range"
          min={100}
          max={800}
          step={50}
          value={fixed}
          onChange={(e) => setFixed(Number(e.target.value))}
        />
        <span className="mono" style={{ minWidth: '5.5em', textAlign: 'right' }}>
          {yen(fixed)}
        </span>
      </div>
      <div className="widget-row">
        <span className="widget-field" style={{ minWidth: '7em' }}>
          変動費率
        </span>
        <input
          className="slider"
          type="range"
          min={10}
          max={90}
          step={5}
          value={ratio}
          onChange={(e) => setRatio(Number(e.target.value))}
        />
        <span className="mono" style={{ minWidth: '5.5em', textAlign: 'right' }}>
          {ratio} %
        </span>
      </div>
      <div className="widget-row">
        <span className="widget-field" style={{ minWidth: '7em' }}>
          いまの売上高
        </span>
        <input
          className="slider"
          type="range"
          min={0}
          max={max}
          step={50}
          value={sales}
          onChange={(e) => setSales(Number(e.target.value))}
        />
        <span className="mono" style={{ minWidth: '5.5em', textAlign: 'right' }}>
          {yen(sales)}
        </span>
      </div>

      <svg className="chart" viewBox="0 0 320 160" role="img" aria-label="売上高と費用の関係">
        <line x1="10" y1="140" x2="315" y2="140" stroke="var(--border)" />
        <line x1="10" y1="5" x2="10" y2="140" stroke="var(--border)" />
        {/* 売上高の線（傾き 1） */}
        <line x1="10" y1="140" x2={10 + x(max)} y2={y(max)} stroke="var(--accent)" strokeWidth="2" />
        {/* 費用の線（固定費 + 売上 × 変動費率） */}
        <line
          x1="10"
          y1={y(fixed)}
          x2={10 + x(max)}
          y2={y(fixed + max * vr)}
          stroke="var(--warn)"
          strokeWidth="2"
        />
        {Number.isFinite(bep) && bep <= max && (
          <>
            <circle cx={10 + x(bep)} cy={y(bep)} r="4" fill="var(--ng)" />
            <line
              x1={10 + x(bep)}
              y1={y(bep)}
              x2={10 + x(bep)}
              y2="140"
              stroke="var(--ng)"
              strokeDasharray="3 3"
            />
          </>
        )}
        <line
          x1={10 + x(sales)}
          y1="5"
          x2={10 + x(sales)}
          y2="140"
          stroke="var(--text-sub)"
          strokeDasharray="2 4"
        />
      </svg>
      <div className="viz-legend">
        <span className="viz-legend-item">
          <span className="viz-swatch" style={{ background: 'var(--accent)' }} />
          売上高
        </span>
        <span className="viz-legend-item">
          <span className="viz-swatch" style={{ background: 'var(--warn)' }} />
          費用（固定費 ＋ 変動費）
        </span>
        <span className="viz-legend-item">
          <span className="viz-swatch" style={{ background: 'var(--ng)' }} />
          損益分岐点
        </span>
      </div>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">損益分岐点の売上高</span>
          <span className="out-value">{Number.isFinite(bep) ? yen(bep) : '—'}</span>
        </div>
        <div className="out-item">
          <span className="out-label">いまの利益</span>
          <span className="out-value">{yen(profit)}</span>
        </div>
        <div className="out-item">
          <span className="out-label">いまの状態</span>
          <span className="out-value">{profit > 0 ? '黒字' : profit < 0 ? '赤字' : 'ちょうどゼロ'}</span>
        </div>
      </div>

      <p className="widget-note">
        売上のうち {ratio} % は変動費に消えるので、固定費と利益に回せるのは残りの {100 - ratio} % です。
        この割合で固定費 {yen(fixed)} をちょうど賄える売上高が損益分岐点なので、{fixed} ÷{' '}
        {Number((1 - vr).toFixed(2))} ＝ {Number.isFinite(bep) ? yen(bep) : '—'} になります。
        <br />
        公式として覚えるより、<strong>「固定費を、利益に回せる割合で割り戻す」</strong>と考えてください。
        固定費を下げても、変動費率を下げても、境目は左へ動きます。
      </p>
    </>
  );
}
