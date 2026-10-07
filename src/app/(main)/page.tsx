import HomeClient from './HomeClient';
import { getPublishedArticlesServer, ServerArticle } from '../utils/serverStore';
import { Article } from '../utils/store';

// Set ISR revalidation to 60 seconds so the home page updates automatically
export const revalidate = 60;

export default async function HomePage() {
  const serverArticles = await getPublishedArticlesServer(200);
  
  // Allow published articles including liturgical readings published for tomorrow
  const cutoff = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const validArticles = serverArticles
    .filter(a => !a.date || new Date(a.date) <= cutoff)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Cast ServerArticle to Article (they are compatible in this context)
  const initialArticles = validArticles as unknown as Article[];

  return <HomeClient initialArticles={initialArticles} />;
}
