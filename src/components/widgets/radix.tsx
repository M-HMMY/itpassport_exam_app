import { useState, type JSX } from 'react';

export const widgetId = 'radix';

const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

/**
 * 2 進数・10 進数・16 進数の行き来を、ビットを押して確かめる道具。
 * 「桁の重みを足す」という考え方が目で見えるようにしている。
 */
export default function RadixWidget(): JSX.Element {
  const [bits, setBits] = useState<number[]>([0, 0, 0, 1, 0, 1, 0, 1]);

  const value = bits.reduce((n, b, i) => n + (b === 1 ? WEIGHTS[i] : 0), 0);
  const on = WEIGHTS.filter((_, i) => bits[i] === 1);
  const hex = value.toString(16).toUpperCase().padStart(2, '0');

  const toggle = (i: number): void => {
    setBits(bits.map((b, j) => (j === i ? 1 - b : b)));
  };

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">2 進数を組み立ててみる</h4>
        <p className="widget-desc">
          四角を押すと 0 と 1 が入れ替わります。1 にした桁の重みを足したものが 10 進数の値です。
        </p>
      </div>

      <div className="viz-bits">
        {bits.map((b, i) => (
          <button
            key={i}
            type="button"
            className={`viz-bit ${b === 1 ? 'on' : ''}`}
            onClick={() => toggle(i)}
            aria-label={`${WEIGHTS[i]} の桁を切り替える`}
          >
            <span className="viz-bit-value">{b}</span>
            <span className="viz-bit-weight">{WEIGHTS[i]}</span>
          </button>
        ))}
      </div>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">2 進数</span>
          <span className="out-value mono">{bits.join('')}</span>
        </div>
        <div className="out-item">
          <span className="out-label">10 進数</span>
          <span className="out-value">{value}</span>
        </div>
        <div className="out-item">
          <span className="out-label">16 進数</span>
          <span className="out-value mono">{hex}</span>
        </div>
      </div>

      <p className="widget-note">
        {on.length === 0
          ? 'すべて 0 なので、値も 0 です。どれか押してみてください。'
          : `1 が立っているのは ${on.join('、')} の桁です。足すと ${on.join(' ＋ ')} ＝ ${value} になります。`}
        <br />
        16 進数は 2 進数 4 桁をひとまとまりにした表し方です。左の 4 桁「{bits.slice(0, 4).join('')}」が
        {hex[0]}、右の 4 桁「{bits.slice(4).join('')}」が {hex[1]} にあたります。
        8 ビットすべてを 1 にすると 255、つまり 8 ビットで表せる最大の値になります。
      </p>
    </>
  );
}
