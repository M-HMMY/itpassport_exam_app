import { useState, type JSX } from 'react';

export const widgetId = 'ipaddress';

const SAMPLES = ['192.168.1.10', '10.0.5.20', '172.16.0.1', '172.32.0.1', '203.0.113.5', '8.8.8.8'];

interface Judged {
  ok: boolean;
  parts: number[];
  isPrivate: boolean;
  reason: string;
}

const judge = (text: string): Judged => {
  const parts = text.trim().split('.');
  const nums = parts.map((p) => Number(p));
  const ok =
    parts.length === 4 &&
    parts.every((p) => p !== '' && /^\d+$/.test(p)) &&
    nums.every((v) => v >= 0 && v <= 255);
  if (!ok) return { ok: false, parts: [], isPrivate: false, reason: '' };
  const [a, b] = nums;
  if (a === 10) {
    return { ok, parts: nums, isPrivate: true, reason: '10 で始まる住所は、内部用として決められた範囲です。' };
  }
  if (a === 172 && b >= 16 && b <= 31) {
    return {
      ok,
      parts: nums,
      isPrivate: true,
      reason: '172 で始まり、2 つ目が 16〜31 の範囲は内部用です。172.32 以降は外で通じる住所になります。',
    };
  }
  if (a === 192 && b === 168) {
    return {
      ok,
      parts: nums,
      isPrivate: true,
      reason: '192.168 で始まる住所は、家庭の LAN でいちばんよく見かける内部用の範囲です。',
    };
  }
  return {
    ok,
    parts: nums,
    isPrivate: false,
    reason: '内部用として決められた 3 つの範囲のどれにも入らないので、外で通じる住所です。',
  };
};

/** IP アドレスを入力して、家の中だけの住所か外で通じる住所かを確かめる道具 */
export default function IpAddressWidget(): JSX.Element {
  const [text, setText] = useState('192.168.1.10');
  const j = judge(text);

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">その住所は、家の中だけ？ 外でも通じる？</h4>
        <p className="widget-desc">
          IP アドレスを入れると、内部だけで使うプライベート IP アドレスか、インターネットで通じるグローバル
          IP アドレスかを判定します。
        </p>
      </div>

      <div className="widget-controls">
        <label className="widget-field">
          IP アドレス
          <input
            type="text"
            className="wide"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="192.168.1.10"
          />
        </label>
        {SAMPLES.map((s) => (
          <button key={s} type="button" className="chip" onClick={() => setText(s)}>
            {s}
          </button>
        ))}
      </div>

      {!j.ok ? (
        <p className="widget-note">
          0〜255 の数を 4 つ、点で区切って入力してください（例：192.168.1.10）。IPv4 アドレスは 32 ビットで、
          8 ビットずつ 4 つに区切って 10 進数で書きます。
        </p>
      ) : (
        <>
          <div className="widget-out">
            <div className="out-item">
              <span className="out-label">種類</span>
              <span className="out-value">
                {j.isPrivate ? 'プライベート' : 'グローバル'}
              </span>
            </div>
            <div className="out-item">
              <span className="out-label">2 進数で見ると</span>
              <span className="out-value mono" style={{ fontSize: 13 }}>
                {j.parts.map((v) => v.toString(2).padStart(8, '0')).join('.')}
              </span>
            </div>
            <div className="out-item">
              <span className="out-label">全体のビット数</span>
              <span className="out-value">32 ビット</span>
            </div>
          </div>

          <p className="widget-note">
            {j.reason}
            <br />
            内部用として決められているのは、10 で始まる範囲、172.16〜172.31 の範囲、192.168 で始まる範囲の
            3 つです。
            {j.isPrivate
              ? 'この住所のままではインターネットへ出られないので、家庭のルータが NAT や NAPT で外で通じる住所へ変換します。'
              : 'この住所はインターネット上で重複しないよう割り当てられ、外部との通信にそのまま使えます。'}
          </p>
        </>
      )}
    </>
  );
}
