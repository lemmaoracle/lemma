#!/usr/bin/env python3
"""GA4 の実測 pageview から `src/data/popularBriefs.ts` を書き出す。

一覧トップの「よく見られている / Most-read」は静的サイトなので生カウンタを
持てない。週次でこれを回して並びを更新する運用にする。

    GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/lemma-ga-mcp-key.json \
    GA4_PROPERTY_ID=527344455 \
    python3 scripts/refresh-popular-briefs.py [--days 28] [--top 5] [--dry-run]

認証は GA4 プロパティに「閲覧者」を付けたサービスアカウント鍵。gcloud の
ADC はスコープ不足（ACCESS_TOKEN_SCOPE_INSUFFICIENT）で通らない。権限が無い
場合 GA4 はエラーではなく**空**を返すので、0 件は権限を疑う。

JA（/ja/critical/briefs/<slug>/）と EN（/critical/briefs/<slug>/）を合算し、
一覧・カテゴリ・柱・アーカイブなど Brief 本文以外のパスは除外する。content に
実在しない slug（公開停止・リネーム）は落とす。同数のときは新しい Brief を上に。
"""

from __future__ import annotations

import argparse
import collections
import datetime as dt
import os
import pathlib
import re
import sys

WEB = pathlib.Path(__file__).resolve().parent.parent
CONTENT = WEB / "src" / "content" / "critical-briefs"
OUT = WEB / "src" / "data" / "popularBriefs.ts"

# /critical/briefs/<NNN>-<slug>/ だけ。index・category/・pillar/・archive/・
# methodology/ は 3 桁始まりでないので自然に外れる。
BRIEF_PATH = re.compile(r"^(/ja)?/critical/briefs/(\d{3}-[a-z0-9-]+)/?$")


def fetch(property_id: str, days: int):
    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    from google.analytics.data_v1beta.types import (
        DateRange,
        Dimension,
        Metric,
        RunReportRequest,
    )

    client = BetaAnalyticsDataClient()
    total: collections.Counter = collections.Counter()
    per_locale: dict[str, collections.Counter] = {
        "ja": collections.Counter(),
        "en": collections.Counter(),
    }
    offset = 0
    while True:
        resp = client.run_report(
            RunReportRequest(
                property=f"properties/{property_id}",
                date_ranges=[
                    DateRange(start_date=f"{days}daysAgo", end_date="yesterday")
                ],
                dimensions=[Dimension(name="pagePath")],
                metrics=[Metric(name="screenPageViews")],
                limit=100000,
                offset=offset,
            )
        )
        for row in resp.rows:
            m = BRIEF_PATH.match(row.dimension_values[0].value.split("?")[0])
            if not m:
                continue
            views = int(row.metric_values[0].value)
            total[m.group(2)] += views
            per_locale["ja" if m.group(1) else "en"][m.group(2)] += views
        offset += len(resp.rows)
        if offset >= resp.row_count:
            break
    return total, per_locale


def render(rows, days: int, top: int, ranked_total: int) -> str:
    today = dt.date.today().isoformat()
    lines = [
        "/**",
        ' * 一覧トップの「よく見られている / Most-read」ランキング。',
        " *",
        " * **手で編集しないこと。** GA4 の実測から生成している:",
        " *",
        " *   GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/lemma-ga-mcp-key.json \\",
        " *   GA4_PROPERTY_ID=527344455 \\",
        " *   python3 scripts/refresh-popular-briefs.py",
        " *",
        f" * 最終更新 {today} — 直近 {days} 日（前日まで）の screenPageViews を",
        " * JA + EN 合算。Brief 本文ページのみ（一覧・カテゴリ・柱・アーカイブは除外）。",
        f" * この窓で閲覧のあった Brief は {ranked_total} 本。並び＝順位（上が1位）。",
        " *",
        " * 窓が短いほど順位は週ごとに入れ替わる。安定させたいときは --days を",
        " * 伸ばす（90 日まではプロパティに保持がある）。値は slug ＝ content の",
        " * ファイル名から .md を落としたもの。[] にするとセクションごと消える。",
        " */",
        "export const POPULAR_BRIEF_SLUGS: ReadonlyArray<string> = [",
    ]
    for slug, views, ja, en in rows[:top]:
        lines.append(f'  "{slug}", // {views} views (JA {ja} + EN {en})')
    lines.append("];")
    return "\n".join(lines) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=28, help="集計窓（日）。既定 28＝直近4週")
    ap.add_argument("--top", type=int, default=5, help="書き出す件数")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    property_id = os.environ.get("GA4_PROPERTY_ID")
    if not property_id:
        print("GA4_PROPERTY_ID が未設定", file=sys.stderr)
        return 2
    if not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        print(
            "GOOGLE_APPLICATION_CREDENTIALS が未設定（ADC はスコープ不足で通らない）",
            file=sys.stderr,
        )
        return 2

    known = {p.stem for p in CONTENT.glob("*.md") if p.stem != "README"}
    total, per_locale = fetch(property_id, args.days)
    unknown = sorted(set(total) - known)
    if unknown:
        print(f"content に無い slug を除外: {', '.join(unknown)}", file=sys.stderr)

    rows = sorted(
        (
            (slug, views, per_locale["ja"][slug], per_locale["en"][slug])
            for slug, views in total.items()
            if slug in known
        ),
        # 同数は新しい Brief（番号が大きい方）を上に＝毎回同じ結果になる。
        key=lambda r: (-r[1], -int(r[0][:3])),
    )
    if not rows:
        print(
            "GA4 が Brief の閲覧を1件も返さなかった。"
            "サービスアカウントに閲覧者権限があるか確認すること"
            "（権限不足でもエラーにならず空が返る）。",
            file=sys.stderr,
        )
        return 1

    out = render(rows, args.days, args.top, len(rows))
    for slug, views, ja, en in rows[: args.top]:
        print(f"{views:5d}  (JA {ja:3d} / EN {en:3d})  {slug}")
    if args.dry_run:
        print("\n--dry-run: 書き込みなし", file=sys.stderr)
        return 0
    OUT.write_text(out, encoding="utf-8")
    print(f"\n{OUT.relative_to(WEB)} を更新", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
