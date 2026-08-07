/**
 * Use Case §2「変化」— 照合の図・「渡すもの」の新旧・仕組み（スラッグ単位）。
 *
 * §2 は 3 面フロー → 表 → 従来/Lemma の 2 枚フロー と作り直してきたが、
 * どれも文章で読ませる形になっていた。ここでは順番を変えて、
 *
 *   1. Lemma の照合そのものを図にする（語数は最小限）。境界線を引き、
 *      原本は内側に留まり、証明だけが外へ出ることを線で見せる。
 *   2. そのうえで「渡すもの」だけを新旧で並べる（チップ 2 段）。
 *   3. 最後に仕組みの説明を、見出しつきの節として置く。
 *
 * 既定値は UseCaseV3Body の `C.flow`（全 UC で成立する一般形）。ここに登録した
 * スラッグだけ、その業務の言葉に差し替わる。
 */
import type { Locale } from "../i18n/translations";

export interface UseCaseFlow {
  /** 境界の内と外の呼び名。原本が留まる側と、証明が届く側。 */
  readonly insideLabel: string;
  readonly outsideLabel: string;
  /** 境界に添える一言。何が越えないのかを言い切る。 */
  readonly boundaryNote: string;
  /** 照合する 2 つの源。 */
  readonly aLabel: string;
  readonly aItems: ReadonlyArray<string>;
  readonly bLabel: string;
  readonly bItems: ReadonlyArray<string>;
  /** 合流点のラベル（既定「照合」）。 */
  readonly opLabel: string;
  /** 照合の結果＝相手に渡る述語。 */
  readonly results: ReadonlyArray<string>;
  /** 境界を越えるものの呼び名。 */
  readonly crossLabel: string;
  /** 受け手と、その人がすること。 */
  readonly toLabel: string;
  readonly toNote: string;
  /** 「渡すもの」の落差。並べるのではなく、データの重さの違いを見せる。 */
  readonly payLead: string;
  readonly wasTitle: string;
  readonly wasDetail: string;
  readonly wasVolume: string;
  readonly nowTitle: string;
  readonly nowDetail: string;
  readonly nowVolume: string;
  /** 仕組みの節 — 要点 3 つ。しるしは順に 🔒 / 証明 / 検証で固定。 */
  readonly mechPoints: ReadonlyArray<{ readonly t: string; readonly d: string }>;
}

const FLOWS: Readonly<
  Record<string, Partial<Readonly<Record<Locale, UseCaseFlow>>>>
> = {
  "kyc-aml-selective-disclosure": {
    ja: {
      insideLabel: "自社のなか",
      outsideLabel: "相手のところ",
      boundaryNote: "本人属性は、ここを越えない",
      aLabel: "照合対象 ── 本人の属性",
      aItems: ["氏名・住所", "生年月日", "取引履歴"],
      bLabel: "照合先 ── KYC/AML の要件",
      bItems: ["年齢", "居住地", "制裁リスト"],
      opLabel: "照合",
      results: ["18 歳以上", "制裁リストに非該当"],
      crossLabel: "証明（約 200 バイト）",
      toLabel: "委託先・提携先・監査人・当局",
      toNote: "リンクを開くだけ。アカウントもキーも要らない",
      payLead: "「本人属性まるごと」から「判定結果（原本 0 文字）」へ。",
      wasTitle: "本人属性・原本まるごと（過剰共有）",
      wasDetail: "氏名・住所・生年月日・取引履歴",
      wasVolume: "数千文字の詳細データ",
      nowTitle: "ZK 証明（最小限）",
      nowDetail: "「18 歳以上」「制裁リストに非該当」の判定事実のみ",
      nowVolume: "約 200 バイト ／ 原本 0 文字",
      mechPoints: [
        {
          t: "原本は外に出さない",
          d: "氏名・住所・生年月日・取引履歴といった本人属性は発行者内に留まる。渡さないので、漏洩・拡散のリスクが動かない。",
        },
        {
          t: "渡すのは「判定結果」だけ",
          d: "「18 歳以上」「制裁リストに非該当」という事実のみを、約 200 バイトの ZK 証明として発行する。",
        },
        {
          t: "相手はリンクを開くだけ",
          d: "委託先も当局もアカウント作成は不要。受け取った証明から「いつ・誰が・改ざんなく発行したか」を自力で確かめられる。",
        },
      ],
    },
  },
  "counterparty-screening": {
    ja: {
      insideLabel: "自社のなか",
      outsideLabel: "相手のところ",
      boundaryNote: "原本は、ここを越えない",
      aLabel: "取引先の情報",
      aItems: ["社名・法人番号", "代表者・役員", "所在地"],
      bLabel: "与信・反社データベース",
      bItems: ["反社・制裁リスト", "信用情報", "取引制限国"],
      opLabel: "照合",
      results: ["反社リストに非該当", "与信区分が基準以上"],
      crossLabel: "証明（約 200 バイト）",
      toLabel: "取引先・グループ会社・監査人",
      toNote: "リンクを開くだけ。アカウントもキーも要らない",
      payLead: "「原本丸ごと」から「判定結果（原本 0 文字）」へ。",
      wasTitle: "原本データ（過剰共有）",
      wasDetail: "取引履歴・個人情報・社内スコア・照会履歴",
      wasVolume: "数千文字の詳細データ",
      nowTitle: "ZK 証明（最小限）",
      nowDetail: "「反社リストに非該当」「与信区分が基準以上」の判定事実のみ",
      nowVolume: "約 200 バイト ／ 原本 0 文字",
      mechPoints: [
        {
          t: "原本は外に出さない",
          d: "取引履歴・詳細スコア・照会履歴といった機微データは自社内に留まる。渡さないので、漏洩・名誉毀損のリスクが動かない。",
        },
        {
          t: "渡すのは「判定結果」だけ",
          d: "「反社リストに非該当」「与信区分が基準以上」という事実のみを、約 200 バイトの ZK 証明として発行する。",
        },
        {
          t: "相手はリンクを開くだけ",
          d: "取引先も監査人もアカウント作成は不要。受け取った証明から「いつ・誰が・改ざんなく発行したか」を自力で確かめられる。",
        },
      ],
    },
  },
  "age-eligibility-verification": {
    ja: {
      insideLabel: "自社のなか",
      outsideLabel: "相手のところ",
      boundaryNote: "生年月日は、ここを越えない",
      aLabel: "照合対象 ── 購入者の属性",
      aItems: ["生年月日", "本人確認書類"],
      bLabel: "照合先 ── 販売資格の条件",
      bItems: ["年齢の下限（20 歳以上 等）", "商品区分ごとの条件"],
      opLabel: "照合",
      results: ["20 歳以上"],
      crossLabel: "証明（約 200 バイト）",
      toLabel: "レジ・EC・監査",
      toNote: "リンクを開くだけ。アカウントもキーも要らない",
      payLead: "「身分証まるごと」から「判定結果（原本 0 文字）」へ。",
      wasTitle: "生年月日・本人確認書類（過剰共有）",
      wasDetail: "券面の氏名・住所・顔写真・番号まで、一緒に見えてしまう",
      wasVolume: "身分証 1 枚まるごと ／ 保存すれば流出の対象",
      nowTitle: "ZK 証明（最小限）",
      nowDetail: "「20 歳以上」の判定事実のみ",
      nowVolume: "約 200 バイト ／ 原本 0 文字",
      mechPoints: [
        {
          t: "原本は外に出さない",
          d: "生年月日・本人確認書類は発行体内に留まる。保存も目視もしないので、流出のリスクが動かない。",
        },
        {
          t: "渡すのは「判定結果」だけ",
          d: "「20 歳以上」という事実のみを、約 200 バイトの ZK 証明として発行する。",
        },
        {
          t: "相手はリンクを開くだけ",
          d: "店舗も監査もアカウント作成は不要。受け取った証明から「いつ・誰が・改ざんなく発行したか」を自力で確かめられる。",
        },
      ],
    },
  },
  "supplier-credential-verification": {
    ja: {
      insideLabel: "自社のなか",
      outsideLabel: "相手のところ",
      boundaryNote: "証書の原本は、ここを越えない",
      aLabel: "照合対象 ── 仕入先の証書",
      aItems: ["許認可", "ISO 認証", "保険証券"],
      bLabel: "照合先 ── 有効条件",
      bItems: ["有効期限", "適用範囲", "取引の要件"],
      opLabel: "照合",
      results: ["許認可が有効", "ISO が有効期限内"],
      crossLabel: "証明（約 200 バイト）",
      toLabel: "発注部門・監査人",
      toNote: "リンクを開くだけ。アカウントもキーも要らない",
      payLead: "「証書一式」から「判定結果（原本 0 文字）」へ。",
      wasTitle: "証書原本一式（過剰共有）",
      wasDetail: "許認可・ISO・保険証券の写しを、更新のたびに回収して保管する",
      wasVolume: "更新のたびに証書一式 ／ 催促と目視確認が付く",
      nowTitle: "ZK 証明（最小限）",
      nowDetail: "「許認可が有効」「ISO が有効期限内」の判定事実のみ",
      nowVolume: "約 200 バイト ／ 原本 0 文字",
      mechPoints: [
        {
          t: "原本は外に出さない",
          d: "許認可・ISO・保険証券といった証書の原本は発行者内に留まる。渡さないので、写しが社内外に溜まらない。",
        },
        {
          t: "渡すのは「判定結果」だけ",
          d: "「許認可が有効」「ISO が有効期限内」という事実のみを、約 200 バイトの ZK 証明として発行する。",
        },
        {
          t: "相手はリンクを開くだけ",
          d: "発注部門も監査人もアカウント作成は不要。受け取った証明から「いつ・誰が・改ざんなく発行したか」を自力で確かめられる。",
        },
      ],
    },
  },
  "credential-presentation": {
    ja: {
      insideLabel: "自社のなか",
      outsideLabel: "相手のところ",
      boundaryNote: "成績・個人情報は、ここを越えない",
      aLabel: "照合対象 ── 応募者の学歴・在籍",
      aItems: ["在籍・卒業の記録", "成績", "学籍の個人情報"],
      bLabel: "照合先 ── 募集要件",
      bItems: ["学位・課程", "卒業／在籍の別", "取得の時期"],
      opLabel: "照合",
      results: ["卒業している", "在籍中である"],
      crossLabel: "証明（約 200 バイト）",
      toLabel: "採用・審査部門・委託元",
      toNote: "リンクを開くだけ。アカウントもキーも要らない",
      payLead: "「証明書一式」から「判定結果（原本 0 文字）」へ。",
      wasTitle: "卒業証明・成績・個人情報（過剰共有）",
      wasDetail: "証明書の原本を提出させ、保管し、偽造かどうかを目視で確かめる",
      wasVolume: "証明書一式 ／ 保管の責任と、学校への照会待ちが付く",
      nowTitle: "ZK 証明（最小限）",
      nowDetail: "「卒業している」「在籍中である」の判定事実のみ",
      nowVolume: "約 200 バイト ／ 原本 0 文字",
      mechPoints: [
        {
          t: "原本は外に出さない",
          d: "成績・学籍の個人情報は発行者（学校）内に留まる。渡さないので、保管の責任と漏洩のリスクが動かない。",
        },
        {
          t: "渡すのは「判定結果」だけ",
          d: "「卒業している」「在籍中である」という事実のみを、約 200 バイトの ZK 証明として発行する。",
        },
        {
          t: "相手はリンクを開くだけ",
          d: "採用も委託元もアカウント作成は不要。学校への照会を待たずに「いつ・誰が・改ざんなく発行したか」を自力で確かめられる。",
        },
      ],
    },
  },
};

export function getUseCaseFlow(
  slug: string,
  locale: Locale,
): UseCaseFlow | undefined {
  return FLOWS[slug]?.[locale];
}
