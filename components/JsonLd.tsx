import React from 'react';

export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'PronaX',
    alternateName: 'PronaX Kosovë',
    url: 'https://pronax-ks.com',
    logo: 'https://pronax-ks.com/logo.png',
    description: 'Prona që kërkon. Shtëpia që meriton. Tregu kryesor i pasurive të paluajtshme në Republikën e Kosovës.',
    email: 'pronaxestate@outlook.com',
    telephone: '+38344000000',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Prishtinë',
      addressRegion: 'Kosovë',
      addressCountry: 'XK',
    },
    currenciesAccepted: 'EUR',
    priceRange: '€€',
    areaServed: {
      '@type': 'Country',
      name: 'Kosovo',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function PropertyJsonLd({ property }: { property: any }) {
  if (!property) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description || property.title,
    url: `https://pronax-ks.com/prona/${property.id}`,
    datePosted: property.published_at || new Date().toISOString(),
    validThrough: property.expires_at || undefined,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: property.currency || 'EUR',
      availability: 'https://schema.org/InStock',
    },
    about: {
      '@type': 'SingleFamilyResidence',
      name: property.title,
      address: {
        '@type': 'PostalAddress',
        addressLocality: property.municipality_id,
        addressCountry: 'XK',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
