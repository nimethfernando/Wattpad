export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.avoralibrary.com';

  const staticRoutes = [
    '',
    '/browse',
    '/community',
    '/contests',
    '/write',
    '/blog',
    '/help',
    '/contact',
    '/terms',
    '/privacy',
    '/dmca',
    '/content-policy',
    '/payment-policy',
    '/accessibility',
    '/about',
    '/guidelines'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));

  const sampleStories = [
    'the-shadow-alchemist',
    'neon-hearts-and-rain',
    'whispers-in-the-hollow',
    'beyond-the-singularity'
  ].map((slug) => ({
    url: `${baseUrl}/story/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticRoutes, ...sampleStories];
}
