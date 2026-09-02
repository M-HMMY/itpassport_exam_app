import { useState, type JSX } from 'react';

export const widgetId = 'pubkey';

type Goal = 'secret' | 'sign';
type Key = 'sender-public' | 'sender-private' | 'receiver-public' | 'receiver-private';

const KEYS: { id: Key; label: string }[] = [
  { id: 'sender-public', label: '送信者の公開鍵' },
  { id: 'sender-private', label: '送信者の秘密鍵' },
  { id: 'receiver-public', label: '受信者の公開鍵' },
  { id: 'receiver-private', label: '受信者の秘密鍵' },
];

const CORRECT: Record<Goal, { first: Key; second: Key; firstLabel: string; secondLabel: string }> = {
  secret: {
    first: 'receiver-public',
    second: 'receiver-private',
    firstLabel: '暗号化に使う鍵',
    secondLabel: '復号に使う鍵',
  },
  sign: {
    first: 'sender-private',
    second: 'sender-public',
    firstLabel: '署名の作成に使う鍵',
    secondLabel: '署名の検証に使う鍵',
  },
};

/** 公開鍵暗号とデジタル署名で、どちらの誰の鍵を使うかを自分で選んで確かめる道具 */
export default function PubkeyWidget(): JSX.Element {
  const [goal, setGoal] = useState<Goal>('secret');
  const [first, setFirst] = useState<Key | null>(null);
  const [second, setSecond] = useState<Key | null>(null);

  const c = CORRECT[goal];
  const done = first !== null && second !== null;
  const allRight = first === c.first && second === c.second;

  const reset = (g: Goal): void => {
    setGoal(g);
    setFirst(null);
    setSecond(null);
  };

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">どの鍵を使う？</h4>
        <p className="widget-desc">
          ここは試験でいちばん取り違えるところです。目的を選び、2 つの場面で使う鍵を自分で選んでみてください。
        </p>
      </div>

      <div className="widget-controls">
        <button
          type="button"
          className={`chip ${goal === 'secret' ? 'on' : ''}`}
          onClick={() => reset('secret')}
        >
          内容を隠して送りたい
        </button>
        <button type="button" className={`chip ${goal === 'sign' ? 'on' : ''}`} onClick={() => reset('sign')}>
          送り主が本人だと示したい
        </button>
      </div>

      {[
        { label: c.firstLabel, value: first, set: setFirst, ok: c.first },
        { label: c.secondLabel, value: second, set: setSecond, ok: c.second },
      ].map((slot, i) => (
        <div className="widget-row" key={i}>
          <span className="widget-field" style={{ minWidth: '9em' }}>
            {slot.label}
          </span>
          {KEYS.map((k) => {
            const chosen = slot.value === k.id;
            const mark = chosen ? (k.id === slot.ok ? ' ○' : ' ×') : '';
            return (
              <button
                key={k.id}
                type="button"
                className={`chip ${chosen ? 'on' : ''}`}
                onClick={() => slot.set(k.id)}
              >
                {k.label}
                {mark}
              </button>
            );
          })}
        </div>
      ))}

      {done && (
        <div className="widget-out">
          <div className="out-item">
            <span className="out-label">判定</span>
            <span className="out-value">{allRight ? '正解' : 'もう一度'}</span>
          </div>
        </div>
      )}

      <p className="widget-note">
        {goal === 'secret' ? (
          <>
            内容を隠して送るときは、<strong>受信者の公開鍵で暗号化</strong>し、
            <strong>受信者の秘密鍵で復号</strong>します。どちらの鍵も持ち主は受信者です。
            誰でも投入できる投入口が公開鍵、持ち主だけが開けられる取り出し鍵が秘密鍵、とイメージしてください。
          </>
        ) : (
          <>
            送り主を示すときは、<strong>送信者の秘密鍵で署名を作り</strong>、
            <strong>送信者の公開鍵で検証</strong>します。内容を隠す暗号化とは、鍵の持ち主が逆になります。
            なお、検証で分かるのは「その公開鍵と対になる秘密鍵で署名された」ことまでです。その公開鍵が本当に
            本人のものかは、認証局が発行した電子証明書で確かめます。
          </>
        )}
      </p>
    </>
  );
}
