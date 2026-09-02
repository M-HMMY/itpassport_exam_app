import { useState, type JSX } from 'react';

export const widgetId = 'logic';

type Op = 'AND' | 'OR' | 'XOR' | 'NOT';

const OPS: { id: Op; label: string; note: string }[] = [
  { id: 'AND', label: 'AND（かつ）', note: '両方が 1 のときだけ 1' },
  { id: 'OR', label: 'OR（または）', note: '少なくとも一方が 1 なら 1' },
  { id: 'XOR', label: 'XOR（どちらか一方）', note: '一方だけが 1 のときに 1' },
  { id: 'NOT', label: 'NOT（〜ではない）', note: '0 と 1 を反対にする。入力は A だけ' },
];

const calc = (op: Op, a: number, b: number): number => {
  if (op === 'AND') return a === 1 && b === 1 ? 1 : 0;
  if (op === 'OR') return a === 1 || b === 1 ? 1 : 0;
  if (op === 'XOR') return a !== b ? 1 : 0;
  return a === 1 ? 0 : 1;
};

/** 論理演算のスイッチを動かし、真理値表のどの行にいるかを確かめる道具 */
export default function LogicWidget(): JSX.Element {
  const [op, setOp] = useState<Op>('AND');
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);

  const result = calc(op, a, b);
  const rows = op === 'NOT' ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
  const opInfo = OPS.find((o) => o.id === op)!;

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">論理演算のスイッチ</h4>
        <p className="widget-desc">
          A と B を切り替えると、結果と、真理値表のどの行にいるかが分かります。
        </p>
      </div>

      <div className="widget-controls">
        <label className="widget-field">
          演算
          <select value={op} onChange={(e) => setOp(e.target.value as Op)}>
            {OPS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="chip" onClick={() => setA(1 - a)}>
          A ＝ {a}
        </button>
        {op !== 'NOT' && (
          <button type="button" className="chip" onClick={() => setB(1 - b)}>
            B ＝ {b}
          </button>
        )}
      </div>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">式</span>
          <span className="out-value mono">
            {op === 'NOT' ? `NOT ${a}` : `${a} ${op} ${b}`}
          </span>
        </div>
        <div className="out-item">
          <span className="out-label">結果</span>
          <span className="out-value">{result}</span>
        </div>
      </div>

      <table className="widget-table">
        <thead>
          <tr>
            <th>A</th>
            {op !== 'NOT' && <th>B</th>}
            <th>結果</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const now = op === 'NOT' ? r[0] === a : r[0] === a && r[1] === b;
            const v = op === 'NOT' ? calc(op, r[0], 0) : calc(op, r[0], r[1]);
            return (
              <tr key={i}>
                <td className={now ? 'hit' : ''}>{r[0]}</td>
                {op !== 'NOT' && <td className={now ? 'hit' : ''}>{r[1]}</td>}
                <td className={now ? 'hit' : ''}>{v}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="widget-note">
        {opInfo.label}は「{opInfo.note}」です。
        {op === 'OR' &&
          '日常語の「または」と違い、両方が 1 のときも 1 になります。「一方だけ」を表したいときは XOR を選んでください。'}
        {op === 'XOR' && 'OR と違うのは、A も B も 1 の行だけです。OR は 1、XOR は 0 になります。'}
        {op === 'AND' && '入力が 2 個なので、組合せは 2 × 2 ＝ 4 通り、つまり表は 4 行になります。'}
        {op === 'NOT' && '入力が 1 個だけなので、表は 2 行しかありません。'}
      </p>
    </>
  );
}
