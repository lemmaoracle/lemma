import rss from '@astrojs/rss';
import { getAllPosts } from '../../data/blog.js';

export async function GET(context) {
  const posts = await getAllPosts('ja');
  
  return rss({
    title: 'Lemma Oracle ブログ',
    description: '分散ロジックと自動推論の研究、理論、応用',
    site: context.site,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.title,
      pubDate: new Date(post.date),
      description: post.abstract,
      link: `/ja/blog/${post.slug}`,
      categories: [post.category],
    })),
    customData: `
      <language>ja-jp</language>
      <copyright>${new Date().getFullYear()} Lemma Oracle</copyright>
      <atom:link href="${new URL('ja/rss.xml', context.site)}" rel="self" type="application/rss+xml" />
    `,
    stylesheet: '/rss/styles.xsl',
  });
}