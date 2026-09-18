import { MetadataRoute } from 'next';
import { getPublishedArticlesServer } from './utils/serverStore';
import { categoryMap } from './utils/categoryMap';

const URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gioitre.giaophanbaria.org';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticlesServer(1000);
  
  // Trang chủ
  const routes = [
    {
      url: `${URL}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    }
  ];

  // Các trang chuyên mục
  Object.keys(categoryMap).forEach(catId => {
    routes.push({
      url: `${URL}/${catId}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    });
  });

  // Các bài viết
  articles.forEach((article) => {
    // Generate slug using title if id is not descriptive enough, but wait, the system relies on `id` in some places and `slug` in others.
    // The current URL structure is /[category]/[id] or /[category]/[slug].
    // Let's use `article.id` as it's the safest fallback if slug doesn't exist. 
    // Wait, the routing logic in SubPage checks for `id === slug` or formatted title.
    // For simplicity, we just use `id` as it's unique and works with the current routing.
    routes.push({
      url: `${URL}/${article.categoryId}/${article.id}`,
      lastModified: article.date ? new Date(article.date) : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    });
  });

  return routes;
}
