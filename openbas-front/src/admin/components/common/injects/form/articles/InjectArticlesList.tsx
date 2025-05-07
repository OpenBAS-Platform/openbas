import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { makeStyles } from 'tss-react/mui';

import { type ArticlesHelper } from '../../../../../../actions/channels/article-helper';
import { type ChannelsHelper } from '../../../../../../actions/channels/channel-helper';
import { useFormatter } from '../../../../../../components/i18n';
import { useHelper } from '../../../../../../store';
import type { Article } from '../../../../../../utils/api-types';
import ChannelIcon from '../../../../components/channels/ChannelIcon';
import ArticlePopover from '../../../articles/ArticlePopover';
import InjectAddArticles from './InjectAddArticles';

const useStyles = makeStyles()(theme => ({
  columns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
  },
  bodyItem: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    fontSize: theme.typography.h3.fontSize,
  },
}));

interface Props {
  readOnly?: boolean;
  allArticles?: Article[];
}

const InjectArticlesList = ({ allArticles = [], readOnly = false }: Props) => {
  const { t } = useFormatter();
  const { control, setValue } = useFormContext();
  const { classes } = useStyles();
  const injectArticlesIds = useWatch({
    control,
    name: 'inject_content.articles',
  }) as string[];

  const [sortedArticles, setSortedArticles] = useState<(Article & {
    article_channel_type: string;
    article_channel_name: string;
  })[]>([]);

  const { articlesMap, channelsMap } = useHelper((helper: ArticlesHelper & ChannelsHelper) => ({
    articlesMap: helper.getArticlesMap(),
    channelsMap: helper.getChannelsMap(),
  }));

  useEffect(() => {
    const articles: (Article & {
      article_channel_type: string;
      article_channel_name: string;
    })[] = (injectArticlesIds || [])
      .map(a => articlesMap[a])
      .filter(a => a !== undefined)
      .map(a => ({
        ...a,
        article_channel_type: channelsMap[a.article_channel]?.channel_type ?? '',
        article_channel_name: channelsMap[a.article_channel]?.channel_name ?? '',
      }))
      .toSorted((a, b) => (a.article_name ?? '').localeCompare(b.article_name ?? ''));
    setSortedArticles(articles);
  }, [injectArticlesIds]);

  const addArticles = (ids: string[]) => setValue('inject_content.articles', [...ids, ...injectArticlesIds]);
  const removeArticle = (articleId: string) => setValue('inject_content.articles', injectArticlesIds.filter(id => id !== articleId));

  return (
    <>
      <List>
        {
          sortedArticles.map(article => (
            <ListItem
              key={article.article_id}
              divider
              secondaryAction={(
                <ArticlePopover
                  article={article}
                  onRemoveArticle={removeArticle}
                  disabled={readOnly}
                />
              )}
            >
              <ListItemIcon>
                <ChannelIcon
                  type={article.article_channel_type}
                  variant="inline"
                />
              </ListItemIcon>
              <ListItemText
                primary={(
                  <div className={classes.columns}>
                    <div className={classes.bodyItem}>
                      {t(article.article_channel_type || 'Unknown')}
                    </div>
                    <div className={classes.bodyItem}>
                      {article.article_channel_name}
                    </div>
                    <div className={classes.bodyItem}>
                      {article.article_name}
                    </div>
                    <div className={classes.bodyItem}>
                      {article.article_author}
                    </div>
                  </div>
                )}
              />
            </ListItem>
          ))
        }
      </List>
      <InjectAddArticles
        articles={allArticles || []}
        injectArticlesIds={injectArticlesIds ?? []}
        handleAddArticles={addArticles}
        disabled={readOnly}
      />
    </>
  );
};

export default InjectArticlesList;
