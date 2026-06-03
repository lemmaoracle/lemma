import type { BlogPost } from "../data/blog";

interface SchemaOrgProps {
  post: BlogPost;
  // blogPath already contains the locale prefix (e.g. "/ja/blog"), so it is
  // sufficient on its own. Combining it with a separate `base` would produce
  // "/ja/ja/blog/<slug>".
  blogPath: string;
}

export default function SchemaOrg({ post, blogPath }: SchemaOrgProps) {
  const articleUrl = `https://lemma.frame00.com${blogPath}/${post.slug}`;
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.abstract,
    url: articleUrl,
    datePublished: post.date ? `${post.date.replace(/\./g, "-")}T00:00:00+09:00` : "",
    dateModified: post.date ? `${post.date.replace(/\./g, "-")}T00:00:00+09:00` : "",
    author: {
      "@type": "Organization",
      name: "Lemma",
    },
    publisher: {
      "@type": "Organization",
      name: "Lemma",
      logo: {
        "@type": "ImageObject",
        url: "https://lemma.frame00.com/favicon.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    image: post.cover || "https://lemma.frame00.com/ogp-default.png",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
