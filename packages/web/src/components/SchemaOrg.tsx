import type { BlogPost } from "../data/blog";

interface SchemaOrgProps {
  post: BlogPost;
  base: string;
  blogPath: string;
}

export default function SchemaOrg({ post, base, blogPath }: SchemaOrgProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.abstract,
    url: `https://lemma.frame00.com${base}${blogPath}/${post.slug}`,
    datePublished: post.date ? `${post.date.replace(/\./g, "-")}T00:00:00+09:00` : "",
    dateModified: post.date ? `${post.date.replace(/\./g, "-")}T00:00:00+09:00` : "",
    author: {
      "@type": "Organization",
      name: "Lemma Oracle",
    },
    publisher: {
      "@type": "Organization",
      name: "Lemma Oracle",
      logo: {
        "@type": "ImageObject",
        url: "https://lemma.frame00.com/favicon.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://lemma.frame00.com${base}${blogPath}/${post.slug}`,
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
