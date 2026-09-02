import { useState, type JSX } from 'react';

export const widgetId = 'color';

const hex2 = (v: number): string => v.toString(16).toUpperCase().padStart(2, '0');

/** 光の三原色を混ぜて、色が数字で表せることを確かめる道具 */
export default function ColorWidget(): JSX.Element {
  const [r, setR] = useState(255);
  const [g, setG] = useState(160);
  const [b, setB] = useState(0);

  const code = `#${hex2(r)}${hex2(g)}${hex2(b)}`;
  const bright = (r * 299 + g * 587 + b * 114) / 1000;

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">光の三原色を混ぜてみる</h4>
        <p className="widget-desc">
          画面の色は、赤・緑・青の光の強さを 0〜255 の数字で決めています。3 つとも最大にすると白になります。
        </p>
      </div>

      {[
        { label: '赤（R）', v: r, set: setR },
        { label: '緑（G）', v: g, set: setG },
        { label: '青（B）', v: b, set: setB },
      ].map((row) => (
        <div className="widget-row" key={row.label}>
          <span className="widget-field" style={{ minWidth: '5.5em' }}>
            {row.label}
          </span>
          <input
            className="slider"
            type="range"
            min={0}
            max={255}
            value={row.v}
            onChange={(e) => row.set(Number(e.target.value))}
          />
          <span className="mono" style={{ minWidth: '3em', textAlign: 'right' }}>
            {row.v}
          </span>
        </div>
      ))}

      <div
        style={{
          height: 72,
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: code,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: bright > 140 ? '#111' : '#fff',
          fontWeight: 700,
          letterSpacing: '0.08em',
        }}
      >
        {code}
      </div>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">16 進数の表記</span>
          <span className="out-value mono">{code}</span>
        </div>
        <div className="out-item">
          <span className="out-label">1 画素に必要なビット数</span>
          <span className="out-value">24 ビット</span>
        </div>
        <div className="out-item">
          <span className="out-label">表せる色数</span>
          <span className="out-value">約 1,678 万色</span>
        </div>
      </div>

      <p className="widget-note">
        赤・緑・青をそれぞれ 8 ビット（256 段階）で表すので、1 画素は合わせて 24 ビットです。組合せは
        256 × 256 × 256 で約 1,678 万色になります。
        <br />
        16 進数の表記は、2 桁ずつが赤・緑・青に対応します。{code} なら、赤が {hex2(r)}（10 進数で {r}）、
        緑が {hex2(g)}（{g}）、青が {hex2(b)}（{b}）です。
        <br />
        これは光を混ぜる考え方（加法混色）です。印刷はインクが光を吸収するので、重ねるほど暗くなる減法混色
        （CMYK）で考えます。
      </p>
    </>
  );
}
