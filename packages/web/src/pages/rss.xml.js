import rss from '@astrojs/rss';
import { getAllPosts } from '../data/blog.js';

export async function GET(context) {
  const posts = await getAllPosts('en');
  
  return rss({
    title: 'Lemma Oracle Blog',
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
    customData: `
      <language>en-us</language>
      <copyright>${new Date().getFullYear()} Lemma Oracle</copyright>
      <atom:link href="${new URL('rss.xml', context.site)}" rel="self" type="application/rss+xml" />
    `,
    stylesheet: '/rss/styles.xsl',
  });
}