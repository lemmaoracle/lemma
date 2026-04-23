import type { BlogPost } from "../data/blog";
import OgImageEn from "../assets/ogp_en.png";
import OgImageJa from "../assets/ogp_ja.png";

interface BaseMetaTagsProps {
  base: string;
  locale?: string;
}

interface HomeMetaTagsProps extends BaseMetaTagsProps {
  type: "home";
  title?: string;
  description?: string;
}

interface ArticleMetaTagsProps extends BaseMetaTagsProps {
  type: "article";
  post: BlogPost;
  blogPath: string;
}

type MetaTagsProps = HomeMetaTagsProps | ArticleMetaTagsProps;

function getDefaultOgImage(locale?: string): string {
  const image = locale === "ja" ? OgImageJa : OgImageEn;
  return `https://lemma.frame00.com${image.src}`;
}

export default function MetaTags(props: MetaTagsProps) {
  if (props.type === "home") {
    const { title = "Lemma Oracle", description, base, locale } = props;
    const ogImage = getDefaultOgImage(locale);
    const url = `https://lemma.frame00.com${base}`;

    return (
      <>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </>
    );
  } else {
    const { post, base, blogPath, locale } = props;
    const ogImage = post.cover || getDefaultOgImage(locale);
    const url = `https://lemma.frame00.com${base}${blogPath}/${post.slug}`;

    return (
      <>
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.abstract} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.abstract} />
        <meta name="twitter:image" content={ogImage} />
      </>
    );
  }
}
