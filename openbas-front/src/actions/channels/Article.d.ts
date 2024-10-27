import type { Article, Channel } from '../../utils/api-types';

export type ArticleStore = Omit<Article, 'article_channel' | 'article_documents'> & {
  article_channel: string | undefined;
  article_documents: string[] | undefined;
};

export type FullArticleStore = ArticleStore & {
  article_fullchannel: Channel;
};
