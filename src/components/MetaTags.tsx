import { Helmet } from 'react-helmet-async';
import { assets } from "@/assets/images";

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const DEFAULT_TITLE = 'LiveScoresResult';
const DEFAULT_DESCRIPTION = 'Live football scores, fixtures, and standings';
const DEFAULT_IMAGE = assets.preloader;
const CANONICAL_BASE = 'https://livescoresresult.com';

const MetaTags = ({
  title = '',
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url = '',
}: MetaTagsProps) => {
  const pageTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;

  const absoluteUrl = (input: string): string => {
    if (!input) return '';
    try {
      // If it's already an absolute URL, return as-is
      const test = new URL(input);
      return test.href;
    } catch {
      // Treat as path
      return `${CANONICAL_BASE}${input.startsWith('/') ? input : `/${input}`}`;
    }
  };

  const canonicalUrl = url
    ? absoluteUrl(url)
    : (typeof window !== 'undefined'
      ? `${CANONICAL_BASE}${window.location.pathname}${window.location.search}`
      : CANONICAL_BASE);
  const ogImage = absoluteUrl(image || DEFAULT_IMAGE);

  const organizationLdJson = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Livescoresresult',
    url: CANONICAL_BASE,
    logo: ogImage,
  };

  const websiteLdJson = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Livescoresresult',
    url: CANONICAL_BASE,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${CANONICAL_BASE}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="livescoreresult" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationLdJson)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteLdJson)}
      </script>
    </Helmet>
  );
};

export default MetaTags;
