import DefaultOgImage from "../assets/ogp-default.png";

interface HomeMetaTagsProps {
  title?: string;
  description?: string;
  base: string;
}

export default function HomeMetaTags({ title = "Lemma Oracle", description, base }: HomeMetaTagsProps) {
  const ogImage = DefaultOgImage.src;

  return (
    <>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`https://lemma.frame00.com${base}`} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </>
  );
}