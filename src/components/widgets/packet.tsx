import { useState, type JSX } from 'react';

export const widgetId = 'packet';

const n = (v: number): string => Math.round(v).toLocaleString('en-US');

/** データをパケットに分けて送る様子と、届くまでの時間を確かめる道具 */
export default function PacketWidget(): JSX.Element {
  const [mb, setMb] = useState(100);
  const [mbps, setMbps] = useState(20);
  const [eff, setEff] = useState(100);

  const megabits = mb * 8;
  const real = (mbps * eff) / 100;
  const sec = real > 0 ? megabits / real : 0;
  const packets = Math.ceil((mb * 1_000_000) / 1500);

  return (
    <>
      <div className="widget-head">
        <h4 className="widget-title">送り終わるまで何秒かかるか</h4>
        <p className="widget-desc">
          大きなデータは小さなパケットに分けて送られます。かかる時間は「運ぶ量 ÷ 1 秒に運べる量」です。
        </p>
      </div>

      <div className="widget-row">
        <span className="widget-field" style={{ minWidth: '8em' }}>
          ファイルの大きさ
        </span>
        <input
          className="slider"
          type="range"
          min={10}
          max={1000}
          step={10}
          value={mb}
          onChange={(e) => setMb(Number(e.target.value))}
        />
        <span className="mono" style={{ minWidth: '5em', textAlign: 'right' }}>
          {mb} MB
        </span>
      </div>
      <div className="widget-row">
        <span className="widget-field" style={{ minWidth: '8em' }}>
          回線の速さ
        </span>
        <input
          className="slider"
          type="range"
          min={1}
          max={200}
          value={mbps}
          onChange={(e) => setMbps(Number(e.target.value))}
        />
        <span className="mono" style={{ minWidth: '5em', textAlign: 'right' }}>
          {mbps} Mbps
        </span>
      </div>
      <div className="widget-row">
        <span className="widget-field" style={{ minWidth: '8em' }}>
          伝送効率
        </span>
        <input
          className="slider"
          type="range"
          min={10}
          max={100}
          step={10}
          value={eff}
          onChange={(e) => setEff(Number(e.target.value))}
        />
        <span className="mono" style={{ minWidth: '5em', textAlign: 'right' }}>
          {eff} %
        </span>
      </div>

      <div className="widget-out">
        <div className="out-item">
          <span className="out-label">ビットに直すと</span>
          <span className="out-value">{n(megabits)} メガビット</span>
        </div>
        <div className="out-item">
          <span className="out-label">実際に使える速さ</span>
          <span className="out-value">{Number(real.toFixed(1))} Mbps</span>
        </div>
        <div className="out-item">
          <span className="out-label">かかる時間</span>
          <span className="out-value">{Number(sec.toFixed(1))} 秒</span>
        </div>
      </div>

      <p className="widget-note">
        1. MB の B はバイト、Mbps の b はビットです。まず {mb} MB を 8 倍して {n(megabits)} メガビットにします。
        <br />
        2. 回線は {mbps} Mbps ですが、宛先などの付加情報も流れるので、効率 {eff} % を掛けて実際に使えるのは{' '}
        {Number(real.toFixed(1))} Mbps です。
        <br />
        3. 「運ぶ量 ÷ 1 秒に運べる量」で、{n(megabits)} ÷ {Number(real.toFixed(1))} ＝{' '}
        {Number(sec.toFixed(1))} 秒になります。
        <br />
        ちなみに、1 つのパケットに 1,500 バイト詰めるとすると、このファイルはおよそ {n(packets)} 個のパケットに
        分かれて届きます。分けて送るからこそ、1 本の通信路を大勢で分け合えます。
      </p>
    </>
  );
}
