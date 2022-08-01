import React, { useState } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import * as R from 'ramda';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  ShareOutlined,
  MoreHorizOutlined,
} from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Slide from '@mui/material/Slide';
import { useFormatter } from '../../../components/i18n';
import Empty from '../../../components/Empty';
import { useHelper } from '../../../store';
import ExpandableMarkdown from '../../../components/ExpandableMarkdown';
import { useQueryParameter } from '../../../utils/Environment';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const useStyles = makeStyles(() => ({
  container: {
    margin: '0 auto',
    width: 1200,
  },
  card: {
    position: 'relative',
  },
  logo: {
    maxHeight: 200,
    maxWidth: 300,
  },
  footer: {
    width: '100%',
    position: 'absolute',
    padding: '0 15px 0 15px',
    left: 0,
    bottom: 10,
  },
}));

const MediaNewspaper = ({ mediaReader }) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t, fldt } = useFormatter();
  const [userId] = useQueryParameter(['user']);
  const [currentArticle, setCurrentArticle] = useState(null);
  const isDark = theme.palette.mode === 'dark';
  const {
    media_exercise: exercise,
    media_articles: articles,
    media_information: media,
  } = mediaReader;
  const { documentsMap } = useHelper((helper) => ({
    documentsMap: helper.getDocumentsMap(),
  }));
  const logo = isDark ? media.media_logo_dark : media.media_logo_light;
  const firstArticle = R.head(articles) || null;
  const firstArticleImages = (firstArticle?.article_documents || [])
    .map((d) => (documentsMap[d.document_id] ? documentsMap[d.document_id] : undefined))
    .filter((d) => d !== undefined)
    .filter((d) => d.document_type.includes('image/'));
  let firstArticleColumns = 12;
  if (firstArticleImages.length === 2) {
    firstArticleColumns = 6;
  } else if (firstArticleImages.length === 3) {
    firstArticleColumns = 4;
  } else if (firstArticleImages.length >= 4) {
    firstArticleColumns = 3;
  }
  const headArticles = R.tail(R.take(4, articles)) || [];
  const otherArticles = R.drop(4, articles) || [];
  const queryParams = userId && userId.length > 0 && userId !== 'null' ? `?userId=${userId}` : '';
  return (
    <div className={classes.container}>
      {logo && media.media_mode !== 'title' && (
        <div
          style={{ margin: '0 auto', textAlign: 'center', marginBottom: 15 }}
        >
          <img
            src={`/api/player/${exercise.exercise_id}/documents/${logo}/media_file${queryParams}`}
            className={classes.logo}
          />
        </div>
      )}
      {media.media_mode !== 'logo' && (
        <Typography
          variant="h1"
          style={{
            textAlign: 'center',
            color: isDark
              ? media.media_primary_color_dark
              : media.media_primary_color_light,
            fontSize: 40,
          }}
        >
          {media.media_name}
        </Typography>
      )}
      <Typography
        variant="h2"
        style={{
          textAlign: 'center',
        }}
      >
        {media.media_description}
      </Typography>
      {!firstArticle && (
        <div style={{ marginTop: 150 }}>
          <Empty message={t('No media pressure entry in this media yet.')} />
        </div>
      )}
      <Grid container={true} spacing={3} style={{ marginTop: 10 }}>
        {firstArticle && (
          <Grid item={true} xs={headArticles.length > 0 ? 8 : 12}>
            <Card
              classes={{ root: classes.card }}
              sx={{ width: '100%', height: '100%' }}
            >
              <CardHeader
                avatar={
                  <Avatar>
                    {(firstArticle.article_author || t('Unknown')).charAt(0)}
                  </Avatar>
                }
                title={firstArticle.article_author || t('Unknown')}
                subheader={fldt(firstArticle.article_virtual_publication)}
              />
              <Grid container={true} spacing={3}>
                {firstArticleImages.map((doc) => (
                  <Grid item={true} xs={firstArticleColumns}>
                    <CardMedia
                      component="img"
                      height="200"
                      src={`/api/player/${exercise.exercise_id}/documents/${doc.document_id}/media_file${queryParams}`}
                    />
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
                  {firstArticle.article_name}
                </Typography>
                <ExpandableMarkdown
                  source={firstArticle.article_content}
                  limit={
                    // eslint-disable-next-line no-nested-ternary
                    headArticles.length === 1
                      ? 500
                      : headArticles.length === 2
                        ? 1000
                        : 1500
                  }
                  controlled={true}
                />
                <div className={classes.footer}>
                  <div style={{ float: 'left' }}>
                    <Button
                      color="secondary"
                      size="small"
                      variant="outlined"
                      startIcon={<MoreHorizOutlined />}
                      onClick={() => setCurrentArticle(firstArticle)}
                    >
                      {t('Read more')}
                    </Button>
                  </div>
                  <div style={{ float: 'right' }}>
                    <Button
                      size="small"
                      startIcon={<ChatBubbleOutlineOutlined />}
                    >
                      {firstArticle.article_comments || 0}
                    </Button>
                    <Button size="small" startIcon={<ShareOutlined />}>
                      {firstArticle.article_shares || 0}
                    </Button>
                    <Button size="small" startIcon={<FavoriteBorderOutlined />}>
                      {firstArticle.article_likes || 0}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        )}
        {headArticles.length > 0 && (
          <Grid item={true} xs={4}>
            {headArticles.map((article, index) => {
              const images = article.article_documents
                .map((d) => (documentsMap[d.document_id]
                  ? documentsMap[d.document_id]
                  : undefined))
                .filter((d) => d !== undefined)
                .filter((d) => d.document_type.includes('image/'));
              let columns = 12;
              if (images.length === 2) {
                columns = 6;
              } else if (images.length === 3) {
                columns = 4;
              } else if (images.length >= 4) {
                columns = 3;
              }
              return (
                <Card
                  key={article.article_id}
                  classes={{ root: classes.card }}
                  sx={{ width: '100%' }}
                  style={{ marginTop: index > 0 ? 20 : 0 }}
                >
                  <CardHeader
                    avatar={
                      <Avatar>
                        {(article.article_author || t('Unknown')).charAt(0)}
                      </Avatar>
                    }
                    title={article.article_author || t('Unknown')}
                    subheader={fldt(article.article_virtual_publication)}
                  />
                  <Grid container={true} spacing={3}>
                    {images.map((doc) => (
                      <Grid item={true} xs={columns}>
                        <CardMedia
                          component="img"
                          height="100"
                          src={`/api/player/${exercise.exercise_id}/documents/${doc.document_id}/media_file${queryParams}`}
                        />
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
                      source={article.article_content}
                      limit={150}
                      controlled={true}
                    />
                    <div className={classes.footer}>
                      <div style={{ float: 'left' }}>
                        <Button
                          color="secondary"
                          size="small"
                          variant="outlined"
                          startIcon={<MoreHorizOutlined />}
                          onClick={() => setCurrentArticle(article)}
                        >
                          {t('Read more')}
                        </Button>
                      </div>
                      <div style={{ float: 'right' }}>
                        <Button
                          size="small"
                          startIcon={<ChatBubbleOutlineOutlined />}
                        >
                          {article.article_comments || 0}
                        </Button>
                        <Button size="small" startIcon={<ShareOutlined />}>
                          {article.article_shares || 0}
                        </Button>
                        <Button
                          size="small"
                          startIcon={<FavoriteBorderOutlined />}
                        >
                          {article.article_likes || 0}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </Grid>
        )}
      </Grid>
      <Grid container={true} spacing={3} style={{ marginTop: 0 }}>
        {otherArticles.map((article) => {
          const images = article.article_documents
            .map((d) => (documentsMap[d.document_id]
              ? documentsMap[d.document_id]
              : undefined))
            .filter((d) => d !== undefined)
            .filter((d) => d.document_type.includes('image/'));
          let columns = 12;
          if (images.length === 2) {
            columns = 6;
          } else if (images.length === 3) {
            columns = 4;
          } else if (images.length >= 4) {
            columns = 3;
          }
          return (
            <Grid item={true} xs={4}>
              <Card
                key={article.article_id}
                classes={{ root: classes.card }}
                sx={{ width: '100%', height: '100%' }}
              >
                <CardHeader
                  avatar={
                    <Avatar>
                      {(article.article_author || t('Unknown')).charAt(0)}
                    </Avatar>
                  }
                  title={article.article_author || t('Unknown')}
                  subheader={fldt(article.article_virtual_publication)}
                />
                <Grid container={true} spacing={3}>
                  {images.map((doc) => (
                    <Grid item={true} xs={columns}>
                      <CardMedia
                        component="img"
                        height="150"
                        src={`/api/player/${exercise.exercise_id}/documents/${doc.document_id}/media_file${queryParams}`}
                      />
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
                    source={article.article_content}
                    limit={200}
                    controlled={true}
                  />
                  <div className={classes.footer}>
                    <div style={{ float: 'left' }}>
                      <Button
                        color="secondary"
                        size="small"
                        variant="outlined"
                        startIcon={<MoreHorizOutlined />}
                        onClick={() => setCurrentArticle(article)}
                      >
                        {t('Read more')}
                      </Button>
                    </div>
                    <div style={{ float: 'right' }}>
                      <Button
                        size="small"
                        startIcon={<ChatBubbleOutlineOutlined />}
                      >
                        {article.article_comments || 0}
                      </Button>
                      <Button size="small" startIcon={<ShareOutlined />}>
                        {article.article_shares || 0}
                      </Button>
                      <Button
                        size="small"
                        startIcon={<FavoriteBorderOutlined />}
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
      <Dialog
        TransitionComponent={Transition}
        open={currentArticle !== null}
        onClose={() => setCurrentArticle(null)}
        fullWidth={true}
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{currentArticle?.article_name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {t('By')} {currentArticle?.article_author || t('Unknown')},{' '}
            {fldt(currentArticle?.article_virtual_publication)}
          </Typography>
          <ExpandableMarkdown
            source={currentArticle?.article_content}
            limit={5000}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaNewspaper;
