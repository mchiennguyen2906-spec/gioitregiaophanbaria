import CategoryClient from './CategoryClient';
import { getPublishedArticlesServer, getDonationsServer } from '../../utils/serverStore';
import { Article, DonationProgram } from '../../utils/store';
import { getTitle } from '../../utils/categoryMap';
import { Metadata } from 'next';

export const revalidate = 60; // 60 seconds

// Dynamic SEO metadata for category pages
export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const category = resolvedParams?.category || '';
  const titleStr = getTitle(category).toUpperCase();

  return {
    title: `${titleStr} - Giới Trẻ BRVT`,
    description: `Khám phá các bài viết, sự kiện, khóa học mới nhất về ${titleStr} tại website Giới trẻ Giáo phận Bà Rịa.`,
  };
}

export default async function CategoryPage({ params }: { params: any }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const category = resolvedParams?.category || '';

  const serverArticles = await getPublishedArticlesServer(200, category);
  const allDonations = await getDonationsServer();
  
  // Filter active donations (not completed)
  const activeDonations = allDonations.filter((d: any) => !d.isCompleted);

  // Cast
  const initialArticles = serverArticles as unknown as Article[];
  const initialDonations = activeDonations as unknown as DonationProgram[];

  return (
    <CategoryClient 
      params={params} 
      initialArticles={initialArticles} 
      initialDonations={initialDonations} 
    />
  );
}
