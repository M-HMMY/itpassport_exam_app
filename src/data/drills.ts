/**
 * 計算ドリル：出題のたびに数値が変わる自動生成問題。
 *
 * 計算問題は同じ問題文を暗記してしまうと本番で崩れるため、
 * 値を振り直して「手順」だけが身に付くようにしている。
 * 生成した問題は復習カード（SRS）には登録しない（同じ問題が二度と現れないため）。
 */

export interface DrillItem {
  question: string;
  choices: string[];
  answer: number;
  /** 計算手順の解説 */
  explanation: string;
}

export interface Drill {
  id: string;
  name: string;
  categoryId: string;
  sectionId: string;
  summary: string;
  generate: () => DrillItem;
}

// ---------------------------------------------------------------- 補助関数

const rnd = (min: number, max: number): number => min + Math.floor(Math.random() * (max - min + 1));

/** 選択肢や条件をランダムに 1 つ選ぶ。新しいドリルを書くときに使う */
export function pick<T>(items: readonly T[]): T {
  return items[rnd(0, items.length - 1)];
}

/** 小数を読みやすく整える（末尾の 0 を落とす）。新しいドリルを書くときに使う */
export function fx(n: number, digits = 2): string {
  return Number(n.toFixed(digits)).toString();
}

/** 正解と誤答候補から 4 択を作る。重複は除き、足りなければ補充関数で埋める */
function build(
  correct: string,
  wrongs: string[],
  fallback?: (i: number) => string,
): { choices: string[]; answer: number } {
  const pool: string[] = [];
  for (const w of wrongs) {
    if (w !== correct && !pool.includes(w)) pool.push(w);
    if (pool.length === 3) break;
  }
  for (let i = 1; pool.length < 3 && i < 60; i++) {
    const extra = fallback ? fallback(i) : String(i);
    if (extra !== correct && !pool.includes(extra)) pool.push(extra);
  }
  const all = [correct, ...pool];
  for (let j = all.length - 1; j > 0; j--) {
    const k = rnd(0, j);
    [all[j], all[k]] = [all[k], all[j]];
  }
  return { choices: all, answer: all.indexOf(correct) };
}

/**
 * 数値の 4 択。ありがちな誤答を先に使い、足りない分は倍率でずらして作る。
 * 正解が 0 や負になりうる問題では倍率では埋まらないので、build に自前の
 * 補充関数を渡すこと（npm run check が「選択肢が 2 個になる」で捕まえる）。
 */
export function buildNumeric(
  correct: number,
  fmt: (n: number) => string,
  mistakes: number[],
): { choices: string[]; answer: number } {
  const wrongs = mistakes.filter((n) => Number.isFinite(n) && n >= 0).map(fmt);
  const factors = [2, 0.5, 1.5, 0.8, 1.25, 3, 0.25, 1.1, 0.9];
  let fi = 0;
  return build(fmt(correct), wrongs, () => fmt(correct * factors[fi++ % factors.length]));
}

// ---------------------------------------------------------------- ドリル本体

/**
 * 計算ドリル。`sectionId` に指定する節が存在しないと `npm run check` が
 * エラーにするので、教本の節を書いてから追加すること。
 *
 * 解説は「公式を当てはめた」で終わらせず、**なぜその式になるか**から書く。
 * 数値が毎回変わるので、手順だけが身に付くようにするのがこのドリルの狙い。
 */
export const DRILLS: Drill[] = [
  {
    id: 'radix-to-decimal',
    name: '2 進数 → 10 進数',
    categoryId: 't-basic',
    sectionId: 't-basic-1',
    summary: '桁の重みを足し合わせて 10 進数に直す',
    generate: () => {
      const bits: number[] = Array.from({ length: 8 }, () => rnd(0, 1));
      // すべて 0 だと問題にならないので、1 桁だけ立てておく
      if (bits.reduce((n, b) => n + b, 0) === 0) bits[rnd(0, 7)] = 1;
      const text = bits.join('');
      const value = bits.reduce((n, b) => n * 2 + b, 0);
      const weights = bits
        .map((b, i) => (b === 1 ? 2 ** (7 - i) : 0))
        .filter((w) => w > 0);
      const { choices, answer } = buildNumeric(value, (n) => String(Math.round(n)), [
        value + 1,
        value - 1,
        Number(text),
        bits.filter((b) => b === 1).length,
      ]);
      return {
        question: `2 進数 ${text} を 10 進数で表すと幾つか。`,
        choices,
        answer,
        explanation:
          `2 進数は右の桁から 1、2、4、8、16、32、64、128 と重みが 2 倍ずつ増えます。` +
          `1 が立っている桁の重みだけを足せば求められます。${weights.join(' ＋ ')} ＝ ${value} です。`,
      };
    },
  },
  {
    id: 'radix-to-binary',
    name: '10 進数 → 2 進数',
    categoryId: 't-basic',
    sectionId: 't-basic-1',
    summary: '2 で割った余りを下の桁から並べる',
    generate: () => {
      const value = rnd(3, 200);
      const text = value.toString(2);
      const steps: string[] = [];
      let n = value;
      while (n > 0) {
        steps.push(`${n} ÷ 2 ＝ ${Math.floor(n / 2)} 余り ${n % 2}`);
        n = Math.floor(n / 2);
      }
      const wrongs = [value + 1, value - 1, value * 2].map((v) => Math.abs(v).toString(2));
      const { choices, answer } = build(text, wrongs, (i) => (value + i * 3).toString(2));
      return {
        question: `10 進数 ${value} を 2 進数で表すと幾つか。`,
        choices,
        answer,
        explanation:
          `2 で割った余りを、下の桁から順に並べます。${steps.join(' / ')}。` +
          `余りを下から読むと ${text} です。逆に、${text} の 1 が立つ桁の重みを足すと ${value} に戻ります。`,
      };
    },
  },
  {
    id: 'capacity-image',
    name: '画像のデータ量',
    categoryId: 't-media',
    sectionId: 't-media-3',
    summary: '画素数と 1 画素のビット数から容量を求める',
    generate: () => {
      const w = pick([320, 640, 800, 1024, 1280]);
      const h = pick([240, 480, 600, 768, 720]);
      const bits = pick([8, 16, 24]);
      const pixels = w * h;
      const totalBits = pixels * bits;
      const bytes = totalBits / 8;
      const fmt = (n: number): string => `${Math.round(n).toLocaleString('en-US')} バイト`;
      const { choices, answer } = buildNumeric(bytes, fmt, [totalBits, pixels, bytes / bits]);
      return {
        question: `横 ${w} 画素、縦 ${h} 画素、1 画素あたり ${bits} ビットの画像がある。圧縮しない場合のデータ量は何バイトか。`,
        choices,
        answer,
        explanation:
          `「1 個分 × 個数」で考えます。画素の総数は ${w} × ${h} ＝ ${pixels.toLocaleString('en-US')} 個です。` +
          `1 画素が ${bits} ビットなので、全体は ${pixels.toLocaleString('en-US')} × ${bits} ＝ ${totalBits.toLocaleString('en-US')} ビットになります。` +
          `1 バイトは 8 ビットなので、8 で割って ${bytes.toLocaleString('en-US')} バイトです。`,
      };
    },
  },
  {
    id: 'capacity-sound',
    name: '音声のデータ量',
    categoryId: 't-basic',
    sectionId: 't-basic-2',
    summary: '標本化周波数・量子化ビット数・秒数から容量を求める',
    generate: () => {
      const hz = pick([8000, 11025, 22050, 44100]);
      const bits = pick([8, 16]);
      const ch = pick([1, 2]);
      const sec = pick([5, 10, 30, 60]);
      const totalBits = hz * bits * ch * sec;
      const bytes = totalBits / 8;
      const fmt = (n: number): string => `${Math.round(n).toLocaleString('en-US')} バイト`;
      const { choices, answer } = buildNumeric(bytes, fmt, [totalBits, bytes / ch, bytes * 8]);
      return {
        question: `標本化周波数 ${hz.toLocaleString('en-US')} Hz、量子化 ${bits} ビット、${ch} チャネルで ${sec} 秒の音声を記録した。データ量は何バイトか。`,
        choices,
        answer,
        explanation:
          `1 秒あたり ${hz.toLocaleString('en-US')} 回測り、1 回が ${bits} ビットです。${ch} チャネルなので ${ch} 倍し、${sec} 秒ぶんを掛けます。` +
          `${hz.toLocaleString('en-US')} × ${bits} × ${ch} × ${sec} ＝ ${totalBits.toLocaleString('en-US')} ビットです。` +
          `8 で割って ${bytes.toLocaleString('en-US')} バイトになります。`,
      };
    },
  },
  {
    id: 'transfer-time',
    name: '通信にかかる時間',
    categoryId: 't-nw',
    sectionId: 't-nw-1',
    summary: '運ぶ量 ÷ 1 秒に運べる量。単位をそろえるのが要点',
    generate: () => {
      const mb = pick([50, 100, 200, 300, 600]);
      const mbps = pick([10, 20, 40, 50, 100]);
      const eff = pick([100, 80, 50]);
      const megabits = mb * 8;
      const real = (mbps * eff) / 100;
      const sec = megabits / real;
      const fmt = (n: number): string => `${fx(n, 1)} 秒`;
      const { choices, answer } = buildNumeric(sec, fmt, [mb / mbps, megabits / mbps, sec * 8]);
      const effText = eff === 100 ? '' : `伝送効率は ${eff}% とする。`;
      return {
        question: `${mb} MB のファイルを ${mbps} Mbps の回線で送ると何秒かかるか。${effText}ここで M は 1,000,000 とする。`,
        choices,
        answer,
        explanation:
          `MB の B はバイト、Mbps の b はビットなので、まず単位をそろえます。` +
          `${mb} MB を 8 倍して ${megabits} メガビットにします。` +
          (eff === 100
            ? ''
            : `実際に使える速さは ${mbps} × ${eff / 100} ＝ ${fx(real)} Mbps です。`) +
          `時間は「運ぶ量 ÷ 1 秒に運べる量」なので、${megabits} ÷ ${fx(real)} ＝ ${fx(sec, 1)} 秒です。`,
      };
    },
  },
  {
    id: 'availability-mtbf',
    name: '稼働率（MTBF と MTTR）',
    categoryId: 't-sys',
    sectionId: 't-sys-2',
    summary: '動いた時間が、1 周期のうちどれだけを占めるか',
    generate: () => {
      const mtbf = pick([90, 180, 270, 380, 450, 900, 1200]);
      const mttr = pick([10, 20, 30, 45, 50, 100]);
      const rate = mtbf / (mtbf + mttr);
      const fmt = (n: number): string => `${fx(n * 100, 1)} %`;
      // 稼働率は 1 を超えないので、倍率でずらす既定の補充は使わない
      const wrongs = [1 - rate, mtbf / (mtbf + mttr * 2), (mtbf * 2) / (mtbf * 2 + mttr)];
      const { choices, answer } = build(fmt(rate), wrongs.map(fmt), (i) =>
        fmt(Math.max(0.05, rate - i * 0.07)),
      );
      return {
        question: `MTBF が ${mtbf} 時間、MTTR が ${mttr} 時間のシステムがある。稼働率は何 % か。`,
        choices,
        answer,
        explanation:
          `1 つの周期は「動いていた時間 ＋ 直していた時間」です。${mtbf} ＋ ${mttr} ＝ ${mtbf + mttr} 時間になります。` +
          `そのうち動いていたのは ${mtbf} 時間なので、稼働率は ${mtbf} ÷ ${mtbf + mttr} ＝ ${fx(rate, 4)} です。` +
          `100 倍して ${fx(rate * 100, 1)} % になります。`,
      };
    },
  },
  {
    id: 'availability-system',
    name: '稼働率（直列と並列）',
    categoryId: 't-sys',
    sectionId: 't-sys-2',
    summary: '直列は掛け算、並列は「両方止まる確率」を 1 から引く',
    generate: () => {
      const a = pick([0.8, 0.85, 0.9, 0.95, 0.98]);
      const b = pick([0.8, 0.85, 0.9, 0.95, 0.98]);
      const serial = pick([true, false]);
      const value = serial ? a * b : 1 - (1 - a) * (1 - b);
      const fmt = (n: number): string => fx(n, 4);
      const { choices, answer } = buildNumeric(value, fmt, [
        serial ? 1 - (1 - a) * (1 - b) : a * b,
        (a + b) / 2,
        Math.min(a, b),
      ]);
      const shape = serial
        ? '両方が動かないとサービスを提供できない直列構成'
        : 'どちらか一方が動けばサービスを提供できる並列構成';
      return {
        question: `稼働率 ${a} の装置 A と稼働率 ${b} の装置 B を、${shape}で接続した。全体の稼働率は幾らか。`,
        choices,
        answer,
        explanation: serial
          ? `直列では A と B が同時に動く必要があります。独立した 2 つのことが両方起きる割合は掛け算なので、` +
            `${a} × ${b} ＝ ${fx(value, 4)} です。「2 台あるから足す」ではありません。`
          : `並列で全体が止まるのは、両方が同時に止まるときだけです。A が止まる確率は 1 － ${a} ＝ ${fx(1 - a, 2)}、` +
            `B が止まる確率は 1 － ${b} ＝ ${fx(1 - b, 2)} なので、両方止まる確率は ${fx((1 - a) * (1 - b), 4)} です。` +
            `求めたいのは動く確率なので、1 から引いて ${fx(value, 4)} になります。`,
      };
    },
  },
  {
    id: 'break-even',
    name: '損益分岐点',
    categoryId: 's-corp',
    sectionId: 's-corp-2',
    summary: '固定費を「利益に回せる割合」で割り戻す',
    generate: () => {
      const sales = pick([1000, 1200, 1500, 2000, 2500]);
      const ratio = pick([0.4, 0.5, 0.6, 0.75, 0.8]);
      const variable = Math.round(sales * ratio);
      const fixed = pick([200, 300, 400, 500, 600]);
      const bep = fixed / (1 - ratio);
      const fmt = (n: number): string => `${Math.round(n).toLocaleString('en-US')} 万円`;
      const { choices, answer } = buildNumeric(bep, fmt, [fixed + variable, fixed / ratio, sales - fixed]);
      return {
        question: `売上高が ${sales.toLocaleString('en-US')} 万円、変動費が ${variable.toLocaleString('en-US')} 万円、固定費が ${fixed} 万円の会社がある。損益分岐点の売上高は何万円か。`,
        choices,
        answer,
        explanation:
          `変動費率は ${variable} ÷ ${sales} ＝ ${fx(ratio, 2)} です。売上のうち固定費と利益に回せる割合は 1 － ${fx(ratio, 2)} ＝ ${fx(1 - ratio, 2)} になります。` +
          `この割合で固定費 ${fixed} 万円をちょうど賄える売上高が損益分岐点なので、${fixed} ÷ ${fx(1 - ratio, 2)} ＝ ${fx(bep, 0)} 万円です。` +
          `確かめると、売上 ${fx(bep, 0)} 万円のときの変動費は ${fx(bep * ratio, 0)} 万円、固定費と合わせて費用は ${fx(bep, 0)} 万円となり、利益はちょうどゼロになります。`,
      };
    },
  },
  {
    id: 'expected-value',
    name: '期待値',
    categoryId: 't-basic',
    sectionId: 't-basic-4',
    summary: 'それぞれの値 × その確率を足す',
    generate: () => {
      const prize = pick([200, 500, 1000]);
      const small = pick([0, 50, 100]);
      const denom = pick([4, 5, 8, 10]);
      const hit = rnd(1, denom - 1);
      const p = hit / denom;
      const value = prize * p + small * (1 - p);
      const fmt = (n: number): string => `${fx(n, 1)} 円`;
      const { choices, answer } = buildNumeric(value, fmt, [
        (prize + small) / 2,
        prize * (1 - p) + small * p,
        prize * p,
      ]);
      return {
        question: `${denom} 本のくじのうち ${hit} 本が当たりで、当たれば ${prize} 円、外れれば ${small} 円もらえる。1 回引いたときの受取額の期待値は幾らか。`,
        choices,
        answer,
        explanation:
          `期待値は「それぞれの値 × その値になる確率」を足したものです。` +
          `当たる確率は ${hit} ÷ ${denom} ＝ ${fx(p, 3)}、外れる確率は ${fx(1 - p, 3)} です。` +
          `${prize} × ${fx(p, 3)} ＝ ${fx(prize * p, 1)} 円、${small} × ${fx(1 - p, 3)} ＝ ${fx(small * (1 - p), 1)} 円で、合わせて ${fx(value, 1)} 円になります。` +
          `毎回この金額をもらえるという意味ではなく、長く繰り返したときの 1 回あたりの平均です。`,
      };
    },
  },
  {
    id: 'profit-rate',
    name: '利益と利益率',
    categoryId: 's-corp',
    sectionId: 's-corp-2',
    summary: '売上高から費用を段階的に引く',
    generate: () => {
      const sales = pick([2000, 3000, 5000, 8000]);
      const cost = Math.round(sales * pick([0.4, 0.5, 0.6, 0.7]));
      const sga = Math.round((sales - cost) * pick([0.3, 0.4, 0.5, 0.6]));
      const gross = sales - cost;
      const operating = gross - sga;
      const askGross = pick([true, false]);
      const value = askGross ? gross : operating;
      const fmt = (n: number): string => `${Math.round(n).toLocaleString('en-US')} 万円`;
      const { choices, answer } = buildNumeric(value, fmt, [
        askGross ? operating : gross,
        sales - sga,
        cost + sga,
      ]);
      return {
        question: `売上高が ${sales.toLocaleString('en-US')} 万円、売上原価が ${cost.toLocaleString('en-US')} 万円、販売費及び一般管理費が ${sga.toLocaleString('en-US')} 万円である。${askGross ? '売上総利益' : '営業利益'}は何万円か。`,
        choices,
        answer,
        explanation: askGross
          ? `売上総利益は、売上高から売上原価だけを引いた額です。${sales} － ${cost} ＝ ${gross} 万円になります。` +
            `ここからさらに販管費 ${sga} 万円を引いた ${operating} 万円は営業利益です。引く費用の種類で 2 つの利益を区別します。`
          : `まず売上総利益を求めます。${sales} － ${cost} ＝ ${gross} 万円です。` +
            `営業利益は、そこから販売費及び一般管理費を引いた額なので、${gross} － ${sga} ＝ ${operating} 万円になります。`,
      };
    },
  },
  {
    id: 'probability-basic',
    name: '確率と場合の数',
    categoryId: 't-basic',
    sectionId: 't-basic-4',
    summary: '当たりの数 ÷ 全体の数。両方起きる確率は掛け算',
    generate: () => {
      const shirts = rnd(2, 5);
      const pants = rnd(2, 5);
      const shoes = rnd(2, 4);
      const askCombination = pick([true, false]);
      if (askCombination) {
        const total = shirts * pants * shoes;
        const { choices, answer } = buildNumeric(total, (n) => `${Math.round(n)} 通り`, [
          shirts + pants + shoes,
          shirts * pants,
          pants * shoes,
        ]);
        return {
          question: `シャツが ${shirts} 種類、ズボンが ${pants} 種類、靴が ${shoes} 種類ある。1 つずつ選ぶ組合せは何通りか。`,
          choices,
          answer,
          explanation:
            `シャツを 1 つ選ぶごとにズボンが ${pants} 通りあり、その 1 つずつに靴が ${shoes} 通りあります。` +
            `枝分かれが重なるので掛け算になり、${shirts} × ${pants} × ${shoes} ＝ ${total} 通りです。` +
            `「A の場合か B の場合か」で重ならないものを合わせるときは足し算になります。`,
        };
      }
      const total = rnd(5, 12);
      const hit = rnd(1, total - 1);
      const p = hit / total;
      const both = p * p;
      const { choices, answer } = buildNumeric(both, (n) => fx(n, 4), [p, p * 2, 1 - both]);
      return {
        question: `${total} 本のくじのうち ${hit} 本が当たりである。引いたくじを毎回戻すとき、2 回続けて当たる確率は幾らか。`,
        choices,
        answer,
        explanation:
          `1 回の当たる確率は ${hit} ÷ ${total} ＝ ${fx(p, 4)} です。くじを戻すので、2 回目も同じ確率になります。` +
          `独立した 2 つのことが両方起きる確率は掛け算なので、${fx(p, 4)} × ${fx(p, 4)} ＝ ${fx(both, 4)} です。` +
          `1 回目に当たった中の、さらに一部が 2 回目も当たる、と考えると掛け算になる理由が分かります。`,
      };
    },
  },
];

export const drillById = (id: string): Drill | undefined => DRILLS.find((d) => d.id === id);
