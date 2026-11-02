/**
 * Brief 一覧の「注目」（ピン・2026-11-02）。
 *
 * 一覧の上段は、公開日の新しい順に自動で出す「新着」3 本と、ここで選ぶ「注目」1〜2 本。
 * 新着は触らなくてよい。ここは、読まれているものと、いま世界的に注目されている事案を
 * 1〜2 本、載せたいときだけ変える（毎週は変えない）。ここに無い・存在しない slug は
 * 一覧が黙って飛ばす。ここに置いた Brief は新着から外れる（重ねて出さない）。
 */
export const BRIEF_PICKS: readonly string[] = [
  "169-binance-hot-wallet-unauthorized-withdrawals",
  "032-booking-payout-account-tampering",
];
