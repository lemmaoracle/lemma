import type { BlogPost } from "../data/blog";

interface ArticleMetaTagsProps {
  post: BlogPost;
  base: string;
  blogPath: string;
}

export default function ArticleMetaTags({ post, base, blogPath }: ArticleMetaTagsProps) {
  const ogImage = post.cover || "https://lemma.frame00.com/ogp-default.png";

  return (
    <>
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.abstract} />
      <meta
        property="og:url"
        content={`https://lemma.frame00.com${base}${blogPath}/${post.slug}`}
      />
      <meta property="og:type" content="article" />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={post.abstract} />
      <meta name="twitter:image" content={ogImage} />
    </>
  );
}
