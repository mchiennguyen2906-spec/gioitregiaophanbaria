import { MetadataRoute } from 'next';

const URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gioitregiaophanbaria.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/admin/'], // Protect admin routes
    },
    sitemap: `${URL}/sitemap.xml`,
  };
}
