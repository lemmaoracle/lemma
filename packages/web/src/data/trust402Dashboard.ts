/**
 * Trust402 · Sell — Dashboard DEMO page content (/trust402/sell/dashboard/).
 *
 * A faithful port of the self-serve Sell admin mock from the rebrand
 * prototype. It is a NON-FUNCTIONAL demo: every figure, listing, wallet,
 * and metric below is illustrative — nothing here is live data. The page
 * is noindexed and reached from the fixed Pay/Sell/Dashboard switcher so
 * the team (and visitors) can see what selling will look like without the
 * switcher pointing at the real, not-yet-public dashboard app.
 *
 * Universal mono tokens (pay/sell/seal, testnet/production, USDC, wallet
 * hex, filenames, raw numbers) stay as plain strings; anything a reader
 * parses as prose is Localized (JA is idiomatic, not literal).
 */
import type { Localized } from "./trust402";

interface Banner {
  readonly strong: Localized;
  readonly rest: Localized;
}
interface Row {
  readonly title: Localized;
  readonly file: string;
  readonly status: "live" | "sandbox";
  readonly statusLabel: Localized;
  readonly price: string;
  readonly uses: string;
  readonly earned: Localized;
  readonly earnedMuted?: boolean;
}

export interface Dashboard {
  readonly meta: { readonly title: Localized; readonly description: Localized };
  readonly backLink: Localized;
  readonly eyebrow: Localized;
  readonly title: Localized;
  readonly tabs: ReadonlyArray<{ readonly label: string; readonly active?: boolean }>;
  readonly tag: Localized;
  readonly modeTest: string;
  readonly modeProd: string;
  readonly walletLabel: Localized;
  readonly walletAddr: string;
  readonly walletSuffix: Localized;
  readonly bannerTest: Banner;
  readonly bannerProd: Banner;
  readonly listingsLabel: Localized;
  readonly newBtn: Localized;
  readonly closeBtn: Localized;
  readonly form: {
    readonly fileLabel: Localized;
    readonly fileName: string;
    readonly fileHint: Localized;
    readonly titleLabel: Localized;
    readonly titleVal: Localized;
    readonly versionLabel: Localized;
    readonly versions: ReadonlyArray<Localized>;
    readonly priceLabel: Localized;
    readonly priceVal: string;
    readonly cur: string;
    readonly publishAsLabel: Localized;
    readonly publishAsYou: Localized;
    readonly publishAsInst: Localized;
    readonly publishBtn: Localized;
    readonly noteTest: Localized;
    readonly noteProd: Localized;
  };
  readonly metrics: {
    readonly activeListings: Localized;
    readonly totalUses: Localized;
    readonly earned: Localized;
    readonly allowance: Localized;
    readonly allowanceVal: string;
    readonly allowanceCap: string;
  };
  /** Dynamic values swapped by the testnet/production toggle. */
  readonly modeData: {
    readonly production: { readonly listings: string; readonly uses: string; readonly earned: string; readonly earnedUnit: string };
    readonly testnet: { readonly listings: string; readonly uses: string; readonly earned: Localized };
  };
  readonly tableHead: {
    readonly listing: Localized;
    readonly status: Localized;
    readonly price: Localized;
    readonly uses: Localized;
    readonly earned: Localized;
  };
  readonly rowsProd: ReadonlyArray<Row>;
  readonly rowsTest: ReadonlyArray<Row>;
  readonly footMain: Banner;
  readonly footNote: Localized;
}

export const T402_DASHBOARD: Dashboard = {
  meta: {
    title: {
      en: "Trust402 · Sell — Dashboard (demo) | Lemma",
      ja: "Trust402 · Sell — ダッシュボード（デモ） | Lemma",
    },
    description: {
      en: "A non-functional demo of the self-serve Sell dashboard: list your work, set a price, rehearse on testnet, then go live. 0% commission, self-custody. Illustrative figures only.",
      ja: "セルフサーブ出品ダッシュボードの非機能デモ。作品を出品し、価格を決め、テストネットでリハーサルしてから公開。手数料0%・自己管理。数値はすべて例示。",
    },
  },
  backLink: { en: "← Trust402 · Sell", ja: "← Trust402 · Sell" },
  eyebrow: {
    en: "dashboard · prototype · non-functional mock",
    ja: "ダッシュボード · プロトタイプ · 非機能モック",
  },
  title: { en: "Dashboard", ja: "ダッシュボード" },
  tabs: [{ label: "pay" }, { label: "sell", active: true }, { label: "seal" }],
  tag: { en: "self-serve · standard", ja: "セルフサーブ · スタンダード" },
  modeTest: "testnet",
  modeProd: "production",
  walletLabel: { en: "wallet", ja: "ウォレット" },
  walletAddr: "0x9c…b3f7",
  walletSuffix: { en: "self-custody", ja: "自己管理" },
  bannerTest: {
    strong: { en: "Testnet · Base Sepolia", ja: "テストネット · Base Sepolia" },
    rest: {
      en: "— no real money. Rehearse the whole loop, then switch to Production.",
      ja: "— 実際のお金は動かない。一連の流れをリハーサルしてから本番へ切り替え。",
    },
  },
  bannerProd: {
    strong: { en: "Production · Base mainnet", ja: "本番 · Base mainnet" },
    rest: {
      en: "— real USDC settles directly to your wallet.",
      ja: "— 実際の USDC がウォレットに直接入金される。",
    },
  },
  listingsLabel: { en: "your listings", ja: "あなたの出品" },
  newBtn: { en: "+ New listing", ja: "＋ 新規出品" },
  closeBtn: { en: "× Close", ja: "× 閉じる" },
  form: {
    fileLabel: { en: "your file", ja: "ファイル" },
    fileName: "bench-q2.csv",
    fileHint: {
      en: "drop a file to upload",
      ja: "ファイルをドロップしてアップロード",
    },
    titleLabel: { en: "title", ja: "タイトル" },
    titleVal: { en: "Benchmark results · Q2", ja: "ベンチマーク結果 · Q2" },
    versionLabel: { en: "version", ja: "バージョン" },
    versions: [
      { en: "v1", ja: "v1" },
      { en: "v2", ja: "v2" },
      { en: "v3 · canonical", ja: "v3 · 正式版" },
    ],
    priceLabel: { en: "price per use", ja: "1回あたりの価格" },
    priceVal: "0.10",
    cur: "USDC",
    publishAsLabel: { en: "publish as", ja: "出品者" },
    publishAsYou: { en: "You (individual)", ja: "自分（個人）" },
    publishAsInst: { en: "Under your institution", ja: "所属機関として" },
    publishBtn: { en: "Generate proof & publish →", ja: "証明を生成して公開 →" },
    noteTest: {
      en: "Publishes in Testnet (Base Sepolia) — test USDC, no real money.",
      ja: "テストネット（Base Sepolia）に公開 — テスト用 USDC、実際のお金は動かない。",
    },
    noteProd: {
      en: "Publishes live — agents discover, verify (free), and pay you in USDC.",
      ja: "本番に公開 — エージェントが見つけ、検証（無料）し、USDC で支払う。",
    },
  },
  metrics: {
    activeListings: { en: "active listings", ja: "公開中の出品" },
    totalUses: { en: "total uses", ja: "累計利用" },
    earned: { en: "earned", ja: "収益" },
    allowance: { en: "allowance · pay+sell", ja: "利用枠 · pay+sell" },
    allowanceVal: "1,240",
    allowanceCap: "/ 5,000",
  },
  modeData: {
    production: { listings: "2", uses: "1,240", earned: "54.00", earnedUnit: "USDC" },
    testnet: { listings: "1", uses: "—", earned: { en: "testnet", ja: "テストネット" } },
  },
  tableHead: {
    listing: { en: "listing", ja: "出品" },
    status: { en: "status", ja: "状態" },
    price: { en: "price", ja: "価格" },
    uses: { en: "uses", ja: "利用" },
    earned: { en: "earned", ja: "収益" },
  },
  rowsProd: [
    {
      title: { en: "Labeled image set — 2026", ja: "ラベル付き画像セット — 2026" },
      file: "my-dataset.csv",
      status: "live",
      statusLabel: { en: "live", ja: "公開中" },
      price: "0.05 USDC",
      uses: "840",
      earned: { en: "42.00 USDC", ja: "42.00 USDC" },
    },
    {
      title: { en: "Cleaned JA text corpus", ja: "クレンジング済み 日本語コーパス" },
      file: "corpus-ja.jsonl",
      status: "live",
      statusLabel: { en: "live", ja: "公開中" },
      price: "0.03 USDC",
      uses: "400",
      earned: { en: "12.00 USDC", ja: "12.00 USDC" },
    },
  ],
  rowsTest: [
    {
      title: { en: "Benchmark results · Q2", ja: "ベンチマーク結果 · Q2" },
      file: "bench-q2.csv",
      status: "sandbox",
      statusLabel: { en: "sandbox", ja: "サンドボックス" },
      price: "0.10 USDC",
      uses: "—",
      earned: { en: "testnet", ja: "テストネット" },
      earnedMuted: true,
    },
  ],
  footMain: {
    strong: {
      en: "0% commission · you keep 100% · self-custody",
      ja: "手数料0% · 100%あなたのもの · 自己管理",
    },
    rest: {
      en: "— paid directly in USDC to your wallet. We never hold your funds.",
      ja: "— USDC がウォレットに直接支払われる。私たちが資金を預かることはない。",
    },
  },
  footNote: {
    en: "One monthly allowance shared across Pay and Sell — producing proofs uses it; verifying is always free. Enterprise deployments live in a separate, isolated console.",
    ja: "月間の利用枠は Pay と Sell で共通 — 証明の生成で消費し、検証は常に無料。エンタープライズ導入は別の隔離コンソールで動く。",
  },
};
