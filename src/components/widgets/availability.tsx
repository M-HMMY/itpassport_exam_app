import { useState, type JSX } from 'react';

export const widgetId = 'availability';

const pct = (v: number): string => `${Number((v * 100).toFixed(3))} %`;

/** 直列と並列で稼働率がどう変わるかを、数値を動かして確かめる道具 */
export default function AvailabilityWidget(): JSX.Element {
  const [a, setA] = useState(90);
  const [b, setB] = useState(90);

  const ra = a / 100;
  const rb = b / 100;
  const serial = ra * rb;
  const parallel = 1 - (1 - ra) * (1 - rb);
  const downDays = (v: number): number => Number(((1 - v) * 365).toFixed(1));

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">直列と並列で、稼働率はどう変わるか</h4>
        <p className="widget-desc">
          装置 A と B の稼働率を動かしてみてください。つなぎ方によって、全体の稼働率はまったく違う値になります。
        </p>
      </div>

      {[
        { label: '装置 A', v: a, set: setA },
        { label: '装置 B', v: b, set: setB },
      ].map((row) => (
        <div className="widget-row" key={row.label}>
          <span className="widget-field" style={{ minWidth: '5em' }}>
            {row.label}
          </span>
          <input
            className="slider"
            type="range"
            min={50}
            max={99}
            value={row.v}
            onChange={(e) => row.set(Number(e.target.value))}
          />
          <span className="mono" style={{ minWidth: '4em', textAlign: 'right' }}>
            {row.v} %
          </span>
        </div>
      ))}

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">直列（両方動いて初めて使える）</span>
          <span className="out-value">{pct(serial)}</span>
        </div>
        <div className="out-item">
          <span className="out-label">並列（どちらか動けば使える）</span>
          <span className="out-value">{pct(parallel)}</span>
        </div>
      </div>

      <table className="widget-table">
        <thead>
          <tr>
            <th>つなぎ方</th>
            <th>考え方</th>
            <th>計算</th>
            <th>1 年あたりの停止</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>直列</td>
            <td>両方が動く確率</td>
            <td className="mono">
              {ra} × {rb} ＝ {Number(serial.toFixed(4))}
            </td>
            <td>約 {downDays(serial)} 日</td>
          </tr>
          <tr>
            <td>並列</td>
            <td>両方が止まる確率を 1 から引く</td>
            <td className="mono">
              1 － ({Number((1 - ra).toFixed(2))} × {Number((1 - rb).toFixed(2))}) ＝{' '}
              {Number(parallel.toFixed(4))}
            </td>
            <td>約 {downDays(parallel)} 日</td>
          </tr>
        </tbody>
      </table>

      <p className="widget-note">
        直列は「A も B も動いていること」が必要なので、独立した 2 つのことが両方起きる割合、つまり掛け算に
        なります。装置を増やすほど全体は下がります。
        <br />
        並列は「両方が同時に止まったときだけ止まる」ので、まず両方が止まる確率を出し、それを 1 から引きます。
        装置を増やすほど全体は上がります。
        <br />
        <strong>「2 台あるから足し算」ではありません。</strong>
        なお、この計算は 2 台の故障が互いに関係ないという前提です。同じ停電で 2 台とも止まるような場合は、
        式どおりにはなりません。
      </p>
    </>
  );
}
