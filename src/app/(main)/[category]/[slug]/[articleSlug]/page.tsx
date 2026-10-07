import ArticlePage, { generateMetadata as articleMetadata } from '../page';
import { Metadata } from 'next';

export const revalidate = 60;

// Dynamic SEO metadata for 3-segment article pages (e.g., /ban-tin/tin-giao-phan-brvt/[articleId])
export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  return articleMetadata({ 
    params: Promise.resolve({ 
      category: resolvedParams?.slug || resolvedParams?.category || '', 
      slug: resolvedParams?.articleSlug || '' 
    }) 
  });
}

export default async function ThreeLevelArticlePage({ params }: { params: any }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  return (
    <ArticlePage 
      params={Promise.resolve({ 
        category: resolvedParams?.slug || resolvedParams?.category || '', 
        slug: resolvedParams?.articleSlug || '' 
      })} 
    />
  );
}
