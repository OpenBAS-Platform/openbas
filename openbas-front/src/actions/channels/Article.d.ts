import type { Article, Channel } from '../../utils/api-types';

export type FullArticleStore = Article & {
  article_fullchannel: Channel;
};
