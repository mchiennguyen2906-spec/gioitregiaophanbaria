import { createClient } from '@supabase/supabase-js';

// We can use the service role key or anon key depending on the need.
// For public pages (Home, Category), we only need anon key and we only fetch 'published' articles.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://spoqkzsrcphgzvmxwadd.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDI5MTcsImV4cCI6MjEwNTAxODkxN30.u4-YIbDD6pRMaufwXrix0DPeDS7SD0VAECMtVcqEnWQ';

// Create a singleton Supabase client for Server Components
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  global: {
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        next: { revalidate: 3600 } // ISR: Cache 1 hour
      });
    }
  }
});

export interface ServerArticle {
  id: string;
  categoryId: string;
  title: string;
  excerpt?: string;
  content: string;
  author: string;
  parish?: string;
  date: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  status: 'published' | 'hidden';
  isFeatured?: boolean;
  isPriority?: boolean;
  isHomeFeatured?: boolean;
  isHomePriority?: boolean;
  metadata?: any;
}

export async function getPublishedArticlesServer(limit = 200, categoryId?: string): Promise<ServerArticle[]> {
  try {
    let query = supabaseServer
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('date', { ascending: false })
      .limit(limit);

    if (categoryId) {
      query = query.eq('categoryId', categoryId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Lỗi khi fetch articles từ server:', error);
      return [];
    }

    // Map column names to camelCase
    return (data || []).map((item: any) => ({
      id: item.id,
      categoryId: item.category_id || item.categoryId,
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      author: item.author,
      parish: item.parish,
      date: item.date,
      thumbnailUrl: item.thumbnail_url || item.thumbnailUrl,
      audioUrl: item.audio_url || item.audioUrl,
      attachmentUrl: item.attachment_url || item.attachmentUrl,
      attachmentName: item.attachment_name || item.attachmentName,
      status: item.status,
      isFeatured: item.is_featured || item.isFeatured,
      isPriority: item.is_priority || item.isPriority,
      isHomeFeatured: item.is_home_featured || item.isHomeFeatured,
      isHomePriority: item.is_home_priority || item.isHomePriority,
      metadata: item.metadata
    })) as ServerArticle[];
  } catch (error) {
    console.error('Lỗi SSR fetch articles:', error);
    return [];
  }
}

export async function getArticleBySlugServer(id: string): Promise<ServerArticle | null> {
  try {
    const { data, error } = await supabaseServer
      .from('articles')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      categoryId: data.category_id || data.categoryId,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      author: data.author,
      parish: data.parish,
      date: data.date,
      thumbnailUrl: data.thumbnail_url || data.thumbnailUrl,
      audioUrl: data.audio_url || data.audioUrl,
      attachmentUrl: data.attachment_url || data.attachmentUrl,
      attachmentName: data.attachment_name || data.attachmentName,
      status: data.status,
      isFeatured: data.is_featured || data.isFeatured,
      isPriority: data.is_priority || data.isPriority,
      isHomeFeatured: data.is_home_featured || data.isHomeFeatured,
      isHomePriority: data.is_home_priority || data.isHomePriority,
      metadata: data.metadata
    } as ServerArticle;
  } catch {
    return null;
  }
}


export async function getDonationsServer() {
  try {
    const { data, error } = await supabaseServer.from('donations').select('*');
    if (error) return [];
    return data;
  } catch {
    return [];
  }
}


export async function getArticleBySlugOrIdServer(slug: string): Promise<ServerArticle | null> {
  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    let query = supabaseServer.from('articles').select('*').eq('status', 'published');
    
    if (isUUID) {
      query = query.eq('id', slug);
    } else {
      query = query.ilike('title', `%${slug}%`);
    }

    const { data, error } = await query.limit(1);
    
    if (error || !data || data.length === 0) return null;
    const item = data[0];
    return {
      id: item.id,
      categoryId: item.category_id || item.categoryId,
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      author: item.author,
      parish: item.parish,
      date: item.date,
      thumbnailUrl: item.thumbnail_url || item.thumbnailUrl,
      audioUrl: item.audio_url || item.audioUrl,
      attachmentUrl: item.attachment_url || item.attachmentUrl,
      attachmentName: item.attachment_name || item.attachmentName,
      status: item.status,
      isFeatured: item.is_featured || item.isFeatured,
      isPriority: item.is_priority || item.isPriority,
      isHomeFeatured: item.is_home_featured || item.isHomeFeatured,
      isHomePriority: item.is_home_priority || item.isHomePriority,
      metadata: item.metadata
    } as ServerArticle;
  } catch {
    return null;
  }
}
