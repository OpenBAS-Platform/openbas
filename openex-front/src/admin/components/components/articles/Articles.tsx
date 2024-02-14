import { Avatar, Button, Card, CardContent, CardHeader, CardMedia, Chip, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import { green, orange } from '@mui/material/colors';
import React, { FunctionComponent, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChatBubbleOutlineOutlined, FavoriteBorderOutlined, ShareOutlined, VisibilityOutlined } from '@mui/icons-material';
import * as R from 'ramda';
import { makeStyles } from '@mui/styles';
import SearchFilter from '../../../../components/SearchFilter';
import ChannelsFilter from '../channels/ChannelsFilter';
import ArticlePopover from './ArticlePopover';
import ExpandableMarkdown from '../../../../components/ExpandableMarkdown';
import ChannelIcon from '../channels/ChannelIcon';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import type { ArticleStore, FullArticleStore } from '../../../../actions/channels/Article';
import type { ChannelOption } from '../channels/ChannelOption';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchChannels } from '../../../../actions/channels/channel-action';
import { fetchDocuments } from '../../../../actions/Document';
import { useAppDispatch } from '../../../../utils/hooks';
import { useFormatter } from '../../../../components/i18n';
import type { DocumentsHelper } from '../../../../actions/helper';
import ExerciseOrScenarioContext, { ArticleContext } from '../../../ExerciseOrScenarioContext';
import CreateArticle from './CreateArticle';
import type { ChannelsHelper } from '../../../../actions/channels/channel-helper';

const useStyles = makeStyles(() => ({
  channel: {
    fontSize: 12,
    float: 'left',
    marginRight: 7,
    maxWidth: 300,
  },
  card: {
    position: 'relative',
  },
  footer: {
    width: '100%',
    position: 'absolute',
    padding: '0 15px 0 15px',
    left: 0,
    bottom: 10,
  },
  button: {
    cursor: 'default',
  },
}));

interface Props {
  articles: ArticleStore[];
}

const Articles: FunctionComponent<Props> = ({
  articles,
}) => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useFormatter();

  // Fetching data
  const { channelsMap, documentsMap } = useHelper((helper: ChannelsHelper & DocumentsHelper) => ({
    channelsMap: helper.getChannelsMap(),
    documentsMap: helper.getDocumentsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchChannels());
    dispatch(fetchDocuments());
  });
  // Filter and sort hook
  const [channels, setChannels] = useState<ChannelOption[]>([]);
  const handleAddChannel = (value: ChannelOption) => {
    setChannels(R.uniq(R.append(value, channels)));
  };
  const handleRemoveChannel = (value: string) => {
    const remainingTags = R.filter((n: ChannelOption) => n.id !== value, channels);
    setChannels(remainingTags);
  };
  const searchColumns = ['name', 'type', 'content'];
  const filtering = useSearchAnFilter('article', 'name', searchColumns);
  // Rendering
  const fullArticles = articles.map((item) => ({
    ...item,
    article_fullchannel: item.article_channel ? channelsMap[item.article_channel] : {},
  }));
  const sortedArticles: FullArticleStore[] = R.filter(
    (n: FullArticleStore) => channels.length === 0
      || channels.map((o) => o.id).includes(n.article_fullchannel.channel_id ?? ''),
    filtering.filterAndSort(fullArticles),
  );
  const channelColor = (type: string | undefined) => {
    switch (type) {
      case 'newspaper':
        return '#3f51b5';
      case 'microblogging':
        return '#00bcd4';
      case 'tv':
        return '#ff9800';
      default:
        return '#ef41e1';
    }
  };

  // Context
  const { permissions, previewArticleUrl } = useContext(ExerciseOrScenarioContext) as ArticleContext;

  return (
    <>
      <div>
        <div style={{ float: 'left', marginRight: 10 }}>
          <SearchFilter
            variant="small"
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
        </div>
        <div style={{ float: 'left', marginRight: 10 }}>
          <ChannelsFilter
            onAddChannel={handleAddChannel}
            onRemoveChannel={handleRemoveChannel}
            currentChannels={channels}
          />
        </div>
      </div>
      <div className="clearfix" />
      <Grid container spacing={3}>
        {sortedArticles.map((article) => {
          const docs = (article.article_documents ?? [])
            .map((docId) => (documentsMap[docId] ? documentsMap[docId] : undefined))
            .filter((d) => d !== undefined);
          const images = docs.filter((d) => d.document_type.includes('image/'));
          const videos = docs.filter((d) => d.document_type.includes('video/'));
          let headersDocs = [];
          if (article.article_fullchannel.channel_type === 'newspaper') {
            headersDocs = images;
          } else if (article.article_fullchannel.channel_type === 'tv') {
            headersDocs = videos;
          } else {
            headersDocs = [...images, ...videos];
          }
          let columns = 12;
          if (headersDocs.length === 2) {
            columns = 6;
          } else if (headersDocs.length === 3) {
            columns = 4;
          } else if (headersDocs.length >= 4) {
            columns = 3;
          }
          // const shouldBeTruncated = (article.article_content || '').length > 500;
          return (
            <Grid key={article.article_id} item xs={4}>
              <Card
                variant="outlined"
                classes={{ root: classes.card }}
                sx={{ width: '100%', height: '100%' }}
              >
                <CardHeader
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: channelColor(
                          article.article_fullchannel.channel_type,
                        ),
                      }}
                    >
                      {(article.article_author || t('Unknown')).charAt(0)}
                    </Avatar>
                  }
                  title={article.article_author || t('Unknown')}
                  subheader={
                    article.article_is_scheduled ? (
                      <span style={{ color: green[500] }}>
                        {t('Scheduled')}
                      </span>
                    ) : (
                      <span style={{ color: orange[500] }}>
                        {t('Not used in the context')}
                      </span>
                    )
                  }
                  action={
                    <React.Fragment>
                      <IconButton
                        aria-haspopup="true"
                        size="large"
                        component={Link}
                        to={previewArticleUrl(article)}
                      >
                        <VisibilityOutlined />
                      </IconButton>
                      <ArticlePopover
                        article={article}
                        documents={docs}
                      />
                    </React.Fragment>
                  }
                />
                <Grid container={true} spacing={3}>
                  {headersDocs.map((doc) => (
                    <Grid key={doc.document_id} item xs={columns}>
                      {doc.document_type.includes('image/') && (
                        <CardMedia
                          component="img"
                          height="150"
                          src={`/api/documents/${doc.document_id}/file`}
                        />
                      )}
                      {doc.document_type.includes('video/') && (
                        <CardMedia
                          component="video"
                          height="150"
                          src={`/api/documents/${doc.document_id}/file`}
                          controls
                        />
                      )}
                    </Grid>
                  ))}
                </Grid>
                <CardContent style={{ marginBottom: 30 }}>
                  <Typography
                    gutterBottom
                    variant="h1"
                    component="div"
                    style={{ margin: '0 auto', textAlign: 'center' }}
                  >
                    {article.article_name}
                  </Typography>
                  <ExpandableMarkdown
                    source={article.article_content ?? ''}
                    limit={500}
                    controlled
                  />
                  <div className={classes.footer}>
                    <div style={{ float: 'left' }}>
                      <Tooltip title={article.article_fullchannel.channel_name}>
                        <Chip
                          icon={
                            <ChannelIcon
                              type={article.article_fullchannel.channel_type}
                              variant="chip"
                            />
                          }
                          classes={{ root: classes.channel }}
                          style={{
                            color: channelColor(
                              article.article_fullchannel.channel_type,
                            ),
                            borderColor: channelColor(
                              article.article_fullchannel.channel_type,
                            ),
                          }}
                          variant="outlined"
                          label={article.article_fullchannel.channel_name}
                        />
                      </Tooltip>
                    </div>
                    <div style={{ float: 'right' }}>
                      <Button
                        size="small"
                        startIcon={<ChatBubbleOutlineOutlined />}
                        className={classes.button}
                      >
                        {article.article_comments || 0}
                      </Button>
                      <Button
                        size="small"
                        startIcon={<ShareOutlined />}
                        className={classes.button}
                      >
                        {article.article_shares || 0}
                      </Button>
                      <Button
                        size="small"
                        startIcon={<FavoriteBorderOutlined />}
                        className={classes.button}
                      >
                        {article.article_likes || 0}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      {permissions.canWrite && (
        <CreateArticle />
      )}
    </>
  );
};

export default Articles;
