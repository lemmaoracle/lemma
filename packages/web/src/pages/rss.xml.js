import rss from '@astrojs/rss';
import { getAllPosts } from '../data/blog.js';

export async function GET(context) {
  const posts = await getAllPosts('en');
  
  // `/rss/styles.xsl` は channel の <lastBuildDate> を「Updated:」として出す。
  // 無いとラベルだけが空で残るので入れる。値はビルド時刻ではなく最新記事の
  // 日付にする——ビルドのたびに変わる値だと、中身が同じでも更新に見える。
  const lastBuildDate = posts[0] ? new Date(posts[0].date).toUTCString() : undefined;

  return rss({
    title: 'Lemma Blog',
    description: 'Research, theory, and applications of decentralized logic and automated reasoning',
    site: context.site,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.title,
      pubDate: new Date(post.date),
      description: post.abstract,
      link: `/blog/${post.slug}`,
      categories: [post.category],
    })),
    // customData の <atom:link rel="self"> は atom 接頭辞を使うので、ここで
    // 名前空間を宣言する。無いと <rss> に xmlns:atom が出ず、厳格な XML
    // パーサ（W3C Feed Validator 等）がフィード全体を弾く。
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `
      <language>en-us</language>
      ${lastBuildDate ? `<lastBuildDate>${lastBuildDate}</lastBuildDate>` : ''}
      <copyright>${new Date().getFullYear()} FRAME00, INC.</copyright>
      <atom:link href="${new URL('rss.xml', context.site)}" rel="self" type="application/rss+xml" />
    `,
    stylesheet: '/rss/styles.xsl',
  });
}