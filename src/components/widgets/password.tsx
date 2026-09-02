import { useState, type JSX } from 'react';

export const widgetId = 'password';

const SETS = [
  { id: 'digit', label: '数字（0〜9）', size: 10 },
  { id: 'lower', label: '英小文字', size: 26 },
  { id: 'upper', label: '英大文字', size: 26 },
  { id: 'symbol', label: '記号', size: 32 },
];

const readable = (sec: number): string => {
  if (!Number.isFinite(sec)) return '天文学的な時間';
  if (sec < 1) return '1 秒未満';
  if (sec < 60) return `約 ${Math.round(sec)} 秒`;
  if (sec < 3600) return `約 ${Math.round(sec / 60)} 分`;
  if (sec < 86400) return `約 ${Math.round(sec / 3600)} 時間`;
  if (sec < 86400 * 365) return `約 ${Math.round(sec / 86400)} 日`;
  const years = sec / (86400 * 365);
  if (years < 1e6) return `約 ${Math.round(years).toLocaleString('en-US')} 年`;
  return `約 ${years.toExponential(1)} 年`;
};

/** 使う文字の種類と長さで、総当たりの手間がどれだけ変わるかを見る道具 */
export default function PasswordWidget(): JSX.Element {
  const [on, setOn] = useState<string[]>(['lower']);
  const [len, setLen] = useState(8);
  const [speed, setSpeed] = useState(1_000_000_000);

  const size = SETS.filter((s) => on.includes(s.id)).reduce((n, s) => n + s.size, 0);
  const total = size > 0 ? Math.pow(size, len) : 0;
  const sec = size > 0 ? total / 2 / speed : 0;

  const toggle = (id: string): void => {
    setOn(on.includes(id) ? on.filter((x) => x !== id) : [...on, id]);
  };

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">総当たりにどれだけ時間がかかるか</h4>
        <p className="widget-desc">
          考えられる組合せを片っ端から試す攻撃を想定します。使う文字の種類と長さを変えて、手間の変わり方を
          見てください。
        </p>
      </div>

      <div className="widget-controls">
        {SETS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`chip ${on.includes(s.id) ? 'on' : ''}`}
            onClick={() => toggle(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="widget-row">
        <span className="widget-field" style={{ minWidth: '6em' }}>
          長さ
        </span>
        <input
          className="slider"
          type="range"
          min={4}
          max={16}
          value={len}
          onChange={(e) => setLen(Number(e.target.value))}
        />
        <span className="mono" style={{ minWidth: '4em', textAlign: 'right' }}>
          {len} 文字
        </span>
      </div>

      <div className="widget-controls">
        <label className="widget-field">
          1 秒に試せる回数
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            <option value={1000}>1 千回</option>
            <option value={1_000_000}>100 万回</option>
            <option value={1_000_000_000}>10 億回</option>
            <option value={1_000_000_000_000}>1 兆回</option>
          </select>
        </label>
      </div>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">使える文字の種類</span>
          <span className="out-value">{size} 種類</span>
        </div>
        <div className="out-item">
          <span className="out-label">組合せの数</span>
          <span className="out-value">
            {size === 0 ? '0' : total < 1e15 ? total.toLocaleString('en-US') : total.toExponential(2)}
          </span>
        </div>
        <div className="out-item">
          <span className="out-label">見つかるまでの目安</span>
          <span className="out-value">{size === 0 ? '—' : readable(sec)}</span>
        </div>
      </div>

      <p className="widget-note">
        {size === 0 ? (
          '文字の種類を 1 つ以上選んでください。'
        ) : (
          <>
            1 文字に {size} 通りあり、それが {len} 文字並ぶので、組合せは {size} の {len} 乗になります。
            文字を 1 つ増やすだけで組合せが {size} 倍になる、というのがここでの要点です。
            平均すると全部の半分を試したあたりで見つかる、と考えて時間を出しています。
          </>
        )}
        <br />
        ただし、長く複雑にしても<strong>使い回していれば意味がありません</strong>。別のサービスから漏れた
        ID とパスワードの組をそのまま試すパスワードリスト攻撃には、長さではなく「サービスごとに変える」ことが
        効きます。試行回数の制限や多要素認証も合わせて使います。
      </p>
    </>
  );
}
