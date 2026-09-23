import getApiClient from "@/services/apiClient";
import type {
  NewsArticle,
  NewsArticleDetail,
  NewsArticlePage,
  NewsAgentStage,
  NewsArticleStatus,
  NewsDeskSummary,
} from "@/types/newsDesk";

const BASE = "/media/news-desk";

interface Envelope<T> {
  success: boolean;
  resp_msg: string;
  resp_code: number;
  data: T;
}

function unwrap<T>(body: Envelope<T>): T {
  return body?.data as T;
}

export interface ListNewsParams {
  status?: NewsArticleStatus;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getNewsDeskSummary(): Promise<NewsDeskSummary> {
  const { data } = await getApiClient().get<Envelope<NewsDeskSummary>>(
    `${BASE}/summary`,
  );
  return unwrap(data);
}

export async function listNewsArticles(
  params: ListNewsParams = {},
): Promise<NewsArticlePage> {
  const { data } = await getApiClient().get<Envelope<NewsArticlePage>>(
    `${BASE}/articles`,
    { params },
  );
  return unwrap(data);
}

export async function getNewsArticle(id: string): Promise<NewsArticleDetail> {
  const { data } = await getApiClient().get<Envelope<NewsArticleDetail>>(
    `${BASE}/articles/${id}`,
  );
  return unwrap(data);
}

export async function requeueNewsArticle(id: string): Promise<NewsArticle> {
  const { data } = await getApiClient().post<Envelope<NewsArticle>>(
    `${BASE}/articles/${id}/requeue`,
  );
  return unwrap(data);
}

export async function skipNewsArticle(id: string): Promise<NewsArticle> {
  const { data } = await getApiClient().post<Envelope<NewsArticle>>(
    `${BASE}/articles/${id}/skip`,
  );
  return unwrap(data);
}

export async function featureNewsArticle(
  id: string,
  featured: boolean,
): Promise<NewsArticle> {
  const { data } = await getApiClient().post<Envelope<NewsArticle>>(
    `${BASE}/articles/${id}/feature`,
    { featured },
  );
  return unwrap(data);
}

export async function runNewsAgentStage(
  stage: NewsAgentStage,
): Promise<{ stage: NewsAgentStage; started: boolean }> {
  const { data } = await getApiClient().post<
    Envelope<{ stage: NewsAgentStage; started: boolean }>
  >(`${BASE}/runs/${stage}`);
  return unwrap(data);
}

export function describeNewsError(error: unknown): string {
  const body = (
    error as { response?: { data?: { resp_msg?: string; error?: string } } }
  )?.response?.data;
  return body?.resp_msg || body?.error || "Something went wrong. Try again.";
}
