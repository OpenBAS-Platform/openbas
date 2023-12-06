import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import Typography from '@mui/material/Typography';
import { useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import * as R from 'ramda';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { green, orange } from '@mui/material/colors';
import {
  ChatBubbleOutlineOutlined,
  ShareOutlined,
  FavoriteBorderOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import DefinitionMenu from '../DefinitionMenu';
import { isExerciseUpdatable } from '../../../../utils/Exercise';
import { useHelper } from '../../../../store';
import CreateArticle from './CreateArticle';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchExerciseArticles, fetchMedias } from '../../../../actions/Media';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import SearchFilter from '../../../../components/SearchFilter';
import { useFormatter } from '../../../../components/i18n';
import MediasFilter from '../../medias/MediasFilter';
import { fetchDocuments } from '../../../../actions/Document';
import ArticlePopover from './ArticlePopover';
import MediaIcon from '../../medias/MediaIcon';
import ExpandableMarkdown from '../../../../components/ExpandableMarkdown';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
  media: {
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

const Articles = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const [medias, setMedias] = useState([]);
  const handleAddMedia = (value) => {
    setMedias(R.uniq(R.append(value, medias)));
  };
  const handleRemoveMedia = (value) => {
    const remainingTags = R.filter((n) => n.id !== value, medias);
    setMedias(remainingTags);
  };
  // Fetching data
  const { exerciseId } = useParams();
  const { exercise, articles, mediasMap, documentsMap } = useHelper(
    (helper) => ({
      exercise: helper.getExercise(exerciseId),
      mediasMap: helper.getMediasMap(),
      documentsMap: helper.getDocumentsMap(),
      articles: helper.getExerciseArticles(exerciseId),
    }),
  );
  useDataLoader(() => {
    dispatch(fetchExerciseArticles(exerciseId));
    dispatch(fetchMedias());
    dispatch(fetchDocuments());
  });
  // Filter and sort hook
  const searchColumns = ['name', 'type', 'content'];
  const filtering = useSearchAnFilter('article', 'name', searchColumns);
  // Rendering
  const fullArticles = articles.map((item) => ({
    ...item,
    article_fullmedia: mediasMap[item.article_media] || {},
  }));
  const sortedArticles = R.filter(
    (n) => medias.length === 0
    || medias.map((o) => o.id).includes(n.article_fullmedia.media_id),
    filtering.filterAndSort(fullArticles),
  );
  const mediaColor = (type) => {
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
  return (
    <div className={classes.container}>
      <DefinitionMenu exerciseId={exerciseId} />
      <div>
        <div style={{ float: 'left', marginRight: 20 }}>
          <SearchFilter
            small={true}
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
        </div>
        <div style={{ float: 'left', marginRight: 20 }}>
          <MediasFilter
            onAddMedia={handleAddMedia}
            onRemoveMedia={handleRemoveMedia}
            currentMedias={medias}
          />
        </div>
      </div>
      <div className="clearfix" />
      <Grid container={true} spacing={3}>
        {sortedArticles.map((article) => {
          const docs = article.article_documents
            .map((docId) => (documentsMap[docId] ? documentsMap[docId] : undefined))
            .filter((d) => d !== undefined);
          const images = docs.filter((d) => d.document_type.includes('image/'));
          const videos = docs.filter((d) => d.document_type.includes('video/'));
          let headersDocs = [];
          if (article.article_fullmedia.media_type === 'newspaper') {
            headersDocs = images;
          } else if (article.article_fullmedia.media_type === 'tv') {
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
            <Grid key={article.article_id} item={true} xs={4}>
              <Card
                variant="outlined"
                classes={{ root: classes.card }}
                sx={{ width: '100%', height: '100%' }}
              >
                <CardHeader
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: mediaColor(
                          article.article_fullmedia.media_type,
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
                        {t('Not used in the exercise')}
                      </span>
                    )
                  }
                  action={
                    <React.Fragment>
                      <IconButton
                        aria-haspopup="true"
                        size="large"
                        component={Link}
                        to={`/medias/${exerciseId}/${article.article_fullmedia.media_id}?preview=true`}
                      >
                        <VisibilityOutlined />
                      </IconButton>
                      <ArticlePopover
                        exercise={exercise}
                        article={article}
                        documents={docs}
                      />
                    </React.Fragment>
                  }
                />
                <Grid container={true} spacing={3}>
                  {headersDocs.map((doc) => (
                    <Grid key={doc.document_id} item={true} xs={columns}>
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
                          controls={true}
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
                    source={article.article_content}
                    limit={500}
                    controlled={true}
                  />
                  <div className={classes.footer}>
                    <div style={{ float: 'left' }}>
                      <Tooltip title={article.article_fullmedia.media_name}>
                        <Chip
                          icon={
                            <MediaIcon
                              type={article.article_fullmedia.media_type}
                              variant="chip"
                            />
                          }
                          classes={{ root: classes.media }}
                          style={{
                            color: mediaColor(
                              article.article_fullmedia.media_type,
                            ),
                            borderColor: mediaColor(
                              article.article_fullmedia.media_type,
                            ),
                          }}
                          variant="outlined"
                          label={article.article_fullmedia.media_name}
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
      {isExerciseUpdatable(exercise) && (
        <CreateArticle exerciseId={exercise.exercise_id} />
      )}
    </div>
  );
};

export default Articles;
