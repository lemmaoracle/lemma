interface HomeSchemaOrgProps {
  title?: string;
  description?: string;
  base: string;
}

export default function HomeSchemaOrg({
  title = "Lemma Oracle",
  description,
  base,
}: HomeSchemaOrgProps) {
  const ORG_ID = "https://lemma.frame00.com/#organization";
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: "Lemma Oracle by FRAME00",
        url: "https://lemma.frame00.com",
        logo: {
          "@type": "ImageObject",
          url: "https://lemma.frame00.com/favicon.svg",
        },
        sameAs: ["https://x.com/lemmaoracle"],
      },
      {
        "@type": "WebSite",
        name: title,
        description: description,
        url: `https://lemma.frame00.com${base}`,
        publisher: { "@id": ORG_ID },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://lemma.frame00.com${base}`,
        },
        image: "https://lemma.frame00.com/ogp-default.png",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
