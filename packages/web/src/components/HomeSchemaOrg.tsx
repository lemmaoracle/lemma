interface HomeSchemaOrgProps {
  title?: string;
  description?: string;
  base: string;
}

export default function HomeSchemaOrg({ title = "Lemma Oracle", description, base }: HomeSchemaOrgProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: title,
    description: description,
    url: `https://lemma.frame00.com${base}`,
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
      "@id": `https://lemma.frame00.com${base}`,
    },
    image: "https://lemma.frame00.com/ogp-default.png",
  };

  return <script type="application/ld+json">{JSON.stringify(schemaData)}</script>;
}