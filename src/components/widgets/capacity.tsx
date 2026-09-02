import { useState, type JSX } from 'react';

export const widgetId = 'capacity';

type Kind = 'image' | 'sound' | 'text';

const n = (v: number): string => Math.round(v).toLocaleString('en-US');

/** 記憶容量を「1 個分 × 個数」で組み立てる道具 */
export default function CapacityWidget(): JSX.Element {
  const [kind, setKind] = useState<Kind>('image');
  const [w, setW] = useState(800);
  const [h, setH] = useState(600);
  const [depth, setDepth] = useState(24);
  const [hz, setHz] = useState(8000);
  const [qbit, setQbit] = useState(8);
  const [ch, setCh] = useState(1);
  const [sec, setSec] = useState(10);
  const [chars, setChars] = useState(10000);
  const [cbyte, setCbyte] = useState(2);

  let bits = 0;
  let steps: string[] = [];
  if (kind === 'image') {
    const px = w * h;
    bits = px * depth;
    steps = [
      `画素の総数は ${n(w)} × ${n(h)} ＝ ${n(px)} 個`,
      `1 画素が ${depth} ビットなので ${n(px)} × ${depth} ＝ ${n(bits)} ビット`,
    ];
  } else if (kind === 'sound') {
    bits = hz * qbit * ch * sec;
    steps = [
      `1 秒あたり ${n(hz)} 回測り、1 回が ${qbit} ビット`,
      `${ch} チャネルぶんを ${sec} 秒続けるので ${n(hz)} × ${qbit} × ${ch} × ${sec} ＝ ${n(bits)} ビット`,
    ];
  } else {
    bits = chars * cbyte * 8;
    steps = [
      `1 文字が ${cbyte} バイトなので ${n(chars)} × ${cbyte} ＝ ${n(chars * cbyte)} バイト`,
      `ビットで見ると ${n(chars * cbyte)} × 8 ＝ ${n(bits)} ビット`,
    ];
  }
  const bytes = bits / 8;

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">記憶容量を組み立てる</h4>
        <p className="widget-desc">
          公式を覚える必要はありません。「1 個分は何ビットか」「それが何個あるか」を掛けるだけです。
        </p>
      </div>

      <div className="widget-controls">
        <label className="widget-field">
          種類
          <select value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
            <option value="image">画像</option>
            <option value="sound">音声</option>
            <option value="text">文字</option>
          </select>
        </label>
        {kind === 'image' && (
          <>
            <label className="widget-field">
              横（画素）
              <input type="number" min={1} value={w} onChange={(e) => setW(Number(e.target.value) || 1)} />
            </label>
            <label className="widget-field">
              縦（画素）
              <input type="number" min={1} value={h} onChange={(e) => setH(Number(e.target.value) || 1)} />
            </label>
            <label className="widget-field">
              1 画素のビット数
              <select value={depth} onChange={(e) => setDepth(Number(e.target.value))}>
                <option value={1}>1（白黒）</option>
                <option value={8}>8（256 階調）</option>
                <option value={16}>16</option>
                <option value={24}>24（フルカラー）</option>
              </select>
            </label>
          </>
        )}
        {kind === 'sound' && (
          <>
            <label className="widget-field">
              標本化周波数（Hz）
              <input type="number" min={1} value={hz} onChange={(e) => setHz(Number(e.target.value) || 1)} />
            </label>
            <label className="widget-field">
              量子化ビット数
              <select value={qbit} onChange={(e) => setQbit(Number(e.target.value))}>
                <option value={8}>8</option>
                <option value={16}>16</option>
              </select>
            </label>
            <label className="widget-field">
              チャネル
              <select value={ch} onChange={(e) => setCh(Number(e.target.value))}>
                <option value={1}>1（モノラル）</option>
                <option value={2}>2（ステレオ）</option>
              </select>
            </label>
            <label className="widget-field">
              秒数
              <input type="number" min={1} value={sec} onChange={(e) => setSec(Number(e.target.value) || 1)} />
            </label>
          </>
        )}
        {kind === 'text' && (
          <>
            <label className="widget-field">
              文字数
              <input
                type="number"
                min={1}
                value={chars}
                onChange={(e) => setChars(Number(e.target.value) || 1)}
              />
            </label>
            <label className="widget-field">
              1 文字のバイト数
              <select value={cbyte} onChange={(e) => setCbyte(Number(e.target.value))}>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </label>
          </>
        )}
      </div>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">ビット</span>
          <span className="out-value">{n(bits)}</span>
        </div>
        <div className="out-item">
          <span className="out-label">バイト</span>
          <span className="out-value">{n(bytes)}</span>
        </div>
        <div className="out-item">
          <span className="out-label">おおよそ</span>
          <span className="out-value">
            {bytes >= 1_000_000
              ? `${(bytes / 1_000_000).toFixed(2)} MB`
              : `${(bytes / 1000).toFixed(1)} KB`}
          </span>
        </div>
      </div>

      <p className="widget-note">
        {steps.map((s, i) => (
          <span key={i}>
            {i + 1}. {s}
            <br />
          </span>
        ))}
        {steps.length + 1}. 1 バイトは 8 ビットなので、8 で割って {n(bytes)} バイト
        <br />
        MB や KB へ直すときは、原則として 1,000 倍ずつで数えます。ただし試験問題に「1 KB＝1,024 バイト」と
        書かれていたら、その指定に従ってください。
      </p>
    </>
  );
}
