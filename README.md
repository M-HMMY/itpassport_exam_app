# ITパスポート 学習アプリ

ITパスポート試験（IPA）の学習アプリです。教本（体系的な読み物）を軸に、確認問題、間隔反復による復習、計算ドリル、模試、成績分析までを 1 つにまとめてあります。学習記録はブラウザの localStorage にのみ保存され、外部には送信されません。

`fe_exam_app`（基本情報技術者試験）→ `e_exam_app`（E資格）と引き継いできた土台の上に作られています。画面の作り・記法・運用の作法はそれらと共通です。

> **現状** アプリの仕組みは完成していますが、**教本と問題の中身はこれから書きます。** 書き方は [CLAUDE.md](CLAUDE.md) を参照してください。

## この試験の特徴

| 項目 | 内容 |
| --- | --- |
| 形式 | 四肢択一の小問のみ（CBT）。記述も実技もない |
| 問題数・時間 | 100 問を 120 分。うち 8 問程度は採点対象外 |
| 受験条件 | なし。誰でも受けられ、ほぼ毎日どこかの会場で実施 |
| 出題数 | ストラテジ系 35・マネジメント系 20・テクノロジ系 45 問 程度 |
| 合格基準 | 総合 600 点以上（1000 点満点）**かつ、3 分野それぞれ 300 点以上** |

**分野別の基準があるため、苦手分野を捨てられません。** このアプリの模試は本番と同じ分野比率で出題し、結果画面では分野別評価点と、その基準を満たしているかを表示します。

要項は改訂されることがあります。申し込みの前に IPA の公式サイトで最新の情報を確認してください。

## 起動

```
npm install     # 初回のみ
npm run dev     # http://localhost:5173 が開く（開発用・自動リロードあり）
npm run build   # 本番ビルド（出力は dist/）
npm run preview # http://localhost:4173 でビルド済みのものを配信
npm run check   # データの整合性チェック（教本・問題・ドリル・描画）
```

`launch.cmd` をダブルクリックしても起動できます。デスクトップにショートカットを作る場合は次を実行します。

```powershell
$ws = New-Object -ComObject WScript.Shell
$lnk = $ws.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Desktop')) 'ITパスポート 学習アプリ.lnk'))
$lnk.TargetPath = 'C:\Dev\itpassport_exam_app\launch.cmd'
$lnk.WorkingDirectory = 'C:\Dev\itpassport_exam_app'
$lnk.IconLocation = 'C:\Dev\itpassport_exam_app\public\icons\icon.ico,0'
$lnk.Save()
```

## iPhone / Android で使う

PWA なので、ホーム画面に追加するとアドレスバーのないアプリとして起動し、一度開いたページはオフラインでも読めます。

**iPhone（Safari で開くこと。Chrome では追加できません）**

1. 公開 URL を Safari で開く
2. 画面下部の共有ボタン（□に↑）をタップ
3. メニューを下にたどって「ホーム画面に追加」

**Android** … Chrome のメニューから「アプリをインストール」または「ホーム画面に追加」。

オフライン保存（Service Worker）は **HTTPS でのみ有効**です。同じ Wi-Fi 内で `http://192.168.x.x:5173` を開く方法でも閲覧はできますが、オフライン保存は効かず、PC 側でサーバを動かしておく必要があります。

学習記録は端末ごとに保存され、PC とスマートフォンでは共有されません。設定画面のエクスポート／インポートで移せます。

## GitHub Pages へ公開する

`.github/workflows/deploy.yml` を用意してあります。`main` ブランチへ push するたびに自動でビルドして公開されます。

初回だけ次の手順が必要です。

```powershell
git remote add origin https://github.com/<ユーザ名>/<リポジトリ名>.git
git push -u origin main
```

その後、GitHub のリポジトリで **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に変更します。数分後に `https://<ユーザ名>.github.io/<リポジトリ名>/` で公開されます。

`vite.config.ts` の `base` は `'./'`（相対パス）なので、リポジトリ名がどうであってもサブディレクトリ配信で正しく動きます。

公開リポジトリにするので、**コミットの署名には GitHub の noreply アドレスを使ってください**（実メールアドレスは履歴に永久に残ります）。

## 画面

| 画面 | 内容 |
| --- | --- |
| ホーム | 進捗、試験日カウントダウン、1 日のノルマ、弱点分野、「もう一度読みたい節」 |
| 教本 | 分野順に読む本編。全文検索・栞・理解度 3 段階の記録つき |
| 体験ツール | 対話ウィジェットの一覧（`src/components/widgets/` にファイルを置くと自動で有効になる） |
| 確認問題 | 四肢択一。分野別／出題数指定／誤答優先。1 問ごとに解説と教本への導線 |
| 計算ドリル | 出題のたびに数値が変わる自動生成問題。手順だけが身に付くようにしている |
| 直前チェック | 全節の「まとめ」「試験のポイント」「よくある勘違い」を抜き出した一覧 |
| 復習 | SM-2 を簡略化した間隔反復。誤答は自動的にここへ回る |
| 模試 | 本番と同じ分野比率・時間制限つきの通し演習。分野別評価点で合否を判定 |
| 成績分析 | 分野別の正答率、日別の推移、模試の履歴 |
| 設定 | 試験日、テーマ、学習記録のエクスポート／インポート |

## キーボード操作

| 画面 | 操作 |
| --- | --- |
| 確認問題・復習 | `1`〜`4` で選択、`Enter` で解答／次の問題へ |
| 教本 | `←` `→` で前後の節へ |
| 模試 | `1`〜`4` で選択、`←` `→` で問題を移動 |

## ディレクトリ

```
src/
  data/
    categories.ts       分野（3 分野 15 章）と章の扉の導入文
    drills.ts           計算ドリルの生成器
    textbook/           教本の本文
    questions/          確認問題
  lib/
    markdown.tsx        本文の描画（Markdown サブセット＋図＋数式＋一問一答）
    math.tsx            数式表示（依存ゼロの簡易実装）
    digest.ts           本文から要点を抜き出す（直前チェックシートの元）
    router.ts           ハッシュルータ
    srs.ts              間隔反復（SM-2 の簡略版）
    search.ts           全文検索
    stats.ts            成績集計
    storage.ts          localStorage への保存
  components/
    widgets/            対話ウィジェット（置くだけで自動登録される）
  pages/                各画面
scripts/
  check.ts              データの整合性チェック（npm run check）
  render-check.tsx      実際に描画して崩れを検出する検査
  emit_textbook.py      教本本文を安全に .ts へ書き出す小道具
  launch.ps1            ローカル起動用のランチャ
```

## 技術的な前提

- React 18 + Vite 5 + TypeScript（strict、未使用変数もエラー）
- **ランタイム依存は React だけ。** ルータも Markdown も数式も自前で、外部通信は一切しない
- 学習記録は localStorage のみ。サーバもアカウントもない
- Service Worker によるオフライン対応（HTTPS でのみ有効）
