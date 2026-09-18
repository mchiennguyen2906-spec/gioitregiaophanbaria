import ArticleClient from './ArticleClient';
import { getArticleBySlugOrIdServer, getPublishedArticlesServer, getDonationsServer } from '../../../utils/serverStore';
import { Article, DonationProgram } from '../../../utils/store';
import { getTitle } from '../../../utils/categoryMap';
import { Metadata } from 'next';

export const revalidate = 60; // 60 seconds

// Dynamic SEO metadata for article pages
export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const category = resolvedParams?.category || '';
  const slug = resolvedParams?.slug || '';
  
  const article = await getArticleBySlugOrIdServer(slug);

  if (article) {
    const url = `https://gioitrebrvt.com/${category}/${article.id}`;
    return {
      title: `${article.title} - Giới Trẻ BRVT`,
      description: article.excerpt || `Đọc bài viết: ${article.title} tại website Giới trẻ Giáo phận Bà Rịa.`,
      openGraph: {
        images: article.thumbnailUrl ? [article.thumbnailUrl] : [],
      },
      alternates: {
        canonical: url,
      }
    };
  }

  const titleStr = getTitle(category, slug).toUpperCase();
  return {
    title: `${titleStr} - Giới Trẻ BRVT`,
    description: `Khám phá chuyên mục ${titleStr} tại website Giới trẻ Giáo phận Bà Rịa.`,
  };
}

export default async function ArticlePage({ params }: { params: any }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const category = resolvedParams?.category || '';
  const slug = resolvedParams?.slug || '';

  const foundArticle = await getArticleBySlugOrIdServer(slug);
  
  let subcategoryArticles: any[] = [];
  if (!foundArticle) {
    // If not a specific article, maybe it's a subcategory
    subcategoryArticles = await getPublishedArticlesServer(200, slug);
  }

  const allDonations = await getDonationsServer();

  const initialArticleDetail = foundArticle as unknown as Article | null;
  const initialSubcategoryArticles = subcategoryArticles as unknown as Article[];
  const initialDonations = allDonations as unknown as DonationProgram[];

  const schemaData = foundArticle ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": foundArticle.title,
    "image": foundArticle.thumbnailUrl ? [foundArticle.thumbnailUrl] : [],
    "datePublished": foundArticle.date,
    "dateModified": foundArticle.date,
    "author": [{
        "@type": "Person",
        "name": foundArticle.author || "Ban Truyền Thông"
    }]
  } : null;

  const breadcrumbSchema = foundArticle ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Trang chủ",
        "item": "https://gioitrebrvt.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": getTitle(category, ""),
        "item": `https://gioitrebrvt.com/${category}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": foundArticle.title,
        "item": `https://gioitrebrvt.com/${category}/${foundArticle.id}`
      }
    ]
  } : null;

  return (
    <>
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <ArticleClient 
        params={params} 
        initialArticleDetail={initialArticleDetail}
        initialSubcategoryArticles={initialSubcategoryArticles}
        initialDonations={initialDonations}
      />
    </>
  );
}
