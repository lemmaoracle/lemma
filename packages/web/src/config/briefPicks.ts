/**
 * Brief 一覧の「いま読む 3 本」（2026-10-17）。
 *
 * 週に一度入れ替える。選び方は、業界と手口が 3 本で重ならないこと
 * （いろいろな業界の読者がどれか 1 本は自分ごととして読めるように）。X に
 * 予約した Brief から選ぶと手間が増えない（X 投稿も「直近 3 本と組み合わせを
 * 重ねない」で選んでいる）。ここに無い・存在しない slug は一覧が黙って飛ばす。
 */
export const BRIEF_PICKS: readonly string[] = [
  "044-arcadia-speecan-raiden-disaster-mail-spoofing",
  "151-toppan-sompo-japan-misdirected-zip",
  "032-booking-payout-account-tampering",
];
