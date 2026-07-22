/**
 * 公開カウンターの参照先。
 *
 * `GET /v1/counters` は検証数(V)・発行数(I)と、それぞれの内訳・最終更新時刻を
 * 返す公開エンドポイントです（workers/packages/api/src/routes/counters.ts）。
 *
 * URL を1か所に置くのは、表示面から「この数字を検証する」のリンク先が必ず
 * 数字の取得元と同じであることを保つためです。両者がずれると、リンクは数字の
 * 出典ではなく別の数字を指すことになります。
 */
export const COUNTERS_API_URL = "https://workers.lemma.workers.dev/v1/counters";
