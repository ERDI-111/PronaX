import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pronax-ks.com';
  const now = new Date();

  // Core static & legal pages
  const routes = [
    '',
    '/rreth-nesh',
    '/kontakti',
    '/faq',
    '/kushtet-e-perdorimit',
    '/politika-e-privatesise',
    '/politika-e-cookies',
    '/politika-e-pagesave',
    '/politika-e-rimbursimit',
    '/rregullat-e-publikimit',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.7,
  }));

  // Public demo properties
  const propertyRoutes = [
    'prop-ks-103',
    'prop-ks-104',
    'prop-ks-105',
  ].map((id) => ({
    url: `${baseUrl}/prona/${id}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [...routes, ...propertyRoutes];
}
