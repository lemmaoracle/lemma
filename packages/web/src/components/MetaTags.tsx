import type { BlogPost } from "../data/blog";
import DefaultOgImage from "../assets/ogp-default.png";

interface BaseMetaTagsProps {
  base: string;
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

export default function MetaTags(props: MetaTagsProps) {
  if (props.type === "home") {
    const { title = "Lemma Oracle", description, base } = props;
    const ogImage = `https://lemma.frame00.com${DefaultOgImage.src}`;
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
    const { post, base, blogPath } = props;
    const ogImage = post.cover || "https://lemma.frame00.com/ogp-default.png";
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