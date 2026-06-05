import type { BlogPost } from "../data/blog";

interface BaseMetaTagsProps {
  locale?: string;
}

interface HomeMetaTagsProps extends BaseMetaTagsProps {
  type: "home";
  title?: string;
  description?: string;
  base: string;
  /** Absolute URL of a homepage-specific OG image; falls back to the locale default when omitted. */
  ogImage?: string;
}

interface PageMetaTagsProps extends BaseMetaTagsProps {
  type: "page";
  title: string;
  description: string;
  pagePath: string;
  /** Absolute URL of a page-specific OG image; falls back to the locale default when omitted. */
  ogImage?: string;
}

interface ArticleMetaTagsProps extends BaseMetaTagsProps {
  type: "article";
  post: BlogPost;
  // blogPath already contains the locale prefix (e.g. "/ja/blog"), so we do
  // NOT need a separate `base` here — using both would double-prefix the URL.
  blogPath: string;
  /** Dynamic per-post OG image URL; falls back to `post.cover` / locale default. */
  ogImage?: string;
}

type MetaTagsProps = HomeMetaTagsProps | PageMetaTagsProps | ArticleMetaTagsProps;

// Default OG image: the locale's cream satori card (same renderer as the
// homepage), so pages without a custom OG share the current brand design
// instead of the retired dark "信頼レイヤー" asset.
function getDefaultOgImage(locale?: string): string {
  return `https://lemma.frame00.com/og/home/${locale === "ja" ? "ja" : "en"}.png`;
}

export default function MetaTags(props: MetaTagsProps) {
  if (props.type === "home") {
    const { title = "Lemma", description, base, locale } = props;
    const ogImage = props.ogImage ?? getDefaultOgImage(locale);
    const url = `https://lemma.frame00.com${base}`;

    return (
      <>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </>
    );
  } else if (props.type === "page") {
    const { title, description, base, pagePath, locale } = props;
    const ogImage = props.ogImage ?? getDefaultOgImage(locale);
    const url = `https://lemma.frame00.com${base}${pagePath}`;

    return (
      <>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </>
    );
  } else {
    const { post, blogPath, locale } = props;
    const ogImage = props.ogImage ?? post.cover ?? getDefaultOgImage(locale);
    // blogPath already includes the locale prefix (e.g. "/ja/blog"); do NOT
    // re-prefix with `base`, that would yield "/ja/ja/blog/<slug>".
    const url = `https://lemma.frame00.com${blogPath}/${post.slug}`;

    return (
      <>
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.abstract} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.abstract} />
        <meta name="twitter:image" content={ogImage} />
      </>
    );
  }
}
