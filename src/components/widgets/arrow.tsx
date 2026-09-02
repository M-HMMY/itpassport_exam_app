import { useState, type JSX } from 'react';

export const widgetId = 'arrow';

/**
 * A のあとに B と C を並行して行い、両方終わってから D を行う仕事を例に、
 * クリティカルパスと余裕日数を確かめる道具。
 */
export default function ArrowWidget(): JSX.Element {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [c, setC] = useState(2);
  const [d, setD] = useState(2);

  const upper = a + b + d;
  const lower = a + c + d;
  const total = Math.max(upper, lower);
  const slack = Math.abs(upper - lower);
  const criticalIsUpper = upper >= lower;

  const rows = [
    { name: 'A 企画', v: a, set: setA },
    { name: 'B 設計', v: b, set: setB },
    { name: 'C 道具準備', v: c, set: setC },
    { name: 'D 最終確認', v: d, set: setD },
  ];

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">クリティカルパスを探す</h4>
        <p className="widget-desc">
          A が終わると B と C を同時に始められ、D は B と C の両方が終わってから始めます。日数を変えると、
          全体を決めている経路が入れ替わります。
        </p>
      </div>

      <div className="widget-controls">
        {rows.map((r) => (
          <label className="widget-field" key={r.name}>
            {r.name}
            <input
              type="number"
              min={1}
              max={20}
              value={r.v}
              onChange={(e) => r.set(Math.max(1, Number(e.target.value) || 1))}
            />
          </label>
        ))}
      </div>

      <table className="widget-table">
        <thead>
          <tr>
            <th>経路</th>
            <th>計算</th>
            <th>日数</th>
            <th>余裕</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A → B → D</td>
            <td className="mono">
              {a} ＋ {b} ＋ {d}
            </td>
            <td className={criticalIsUpper ? 'hit' : ''}>{upper} 日</td>
            <td>{criticalIsUpper ? '0 日' : `${total - upper} 日`}</td>
          </tr>
          <tr>
            <td>A → C → D</td>
            <td className="mono">
              {a} ＋ {c} ＋ {d}
            </td>
            <td className={!criticalIsUpper ? 'hit' : ''}>{lower} 日</td>
            <td>{!criticalIsUpper ? '0 日' : `${total - lower} 日`}</td>
          </tr>
        </tbody>
      </table>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">全体の最短日数</span>
          <span className="out-value">{total} 日</span>
        </div>
        <div className="out-item">
          <span className="out-label">クリティカルパス</span>
          <span className="out-value" style={{ fontSize: 15 }}>
            {criticalIsUpper ? 'A → B → D' : 'A → C → D'}
          </span>
        </div>
        <div className="out-item">
          <span className="out-label">もう一方の余裕</span>
          <span className="out-value">{slack} 日</span>
        </div>
      </div>

      <p className="widget-note">
        B と C は同時に進められますが、D は<strong>両方の終了を待ちます</strong>。だから全体の日数を決めるのは、
        長い方の経路です。いまは {criticalIsUpper ? 'A → B → D' : 'A → C → D'} が {total} 日で、こちらが
        クリティカルパスです。
        <br />
        {slack === 0
          ? '両方の経路が同じ日数なので、どちらにも余裕がありません。この状態では、どの作業が遅れても全体が遅れます。'
          : `もう一方の経路には ${slack} 日の余裕があります。この範囲なら遅れても全体の日数は変わりません。`}
        <br />
        クリティカルパスは「作業の数が多い経路」でも「危険そうな作業を含む経路」でもありません。
        <strong>日数を足して求める、最も余裕がない経路</strong>です。
        {criticalIsUpper
          ? ' B を 1 日縮めると、全体も縮むか、もう一方の経路と並ぶところまで縮みます。'
          : ' C を 1 日縮めると、全体も縮むか、もう一方の経路と並ぶところまで縮みます。'}
      </p>
    </>
  );
}
