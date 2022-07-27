import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import Typography from '@mui/material/Typography';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import * as R from 'ramda';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
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
import { truncate } from '../../../../utils/String';
import ArticlePopover from './ArticlePopover';
import MediaIcon from '../../medias/MediaIcon';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
  media: {
    fontSize: 12,
    float: 'left',
    marginRight: 7,
    width: 120,
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
            .map((d) => (documentsMap[d] ? documentsMap[d] : undefined))
            .filter((d) => d !== undefined);
          let columns = 12;
          if (docs.length === 2) {
            columns = 6;
          } else if (docs.length === 3) {
            columns = 4;
          } else {
            columns = 3;
          }
          return (
            <Grid item={true} xs={4}>
              <Card
                sx={{ width: '100%', height: '100%' }}
                key={article.article_id}
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
                    article.article_is_scheduled
                      ? t('Scheduled / in use')
                      : t('Not used in the exercise')
                  }
                  action={
                    <ArticlePopover exercise={exercise} article={article} />
                  }
                />
                <Grid container={true} spacing={3}>
                  {docs.map((doc) => (
                    <Grid item={true} xs={columns}>
                      <CardMedia
                        component="img"
                        height="150"
                        image={`/api/documents/${doc.document_id}/file`}
                      />
                    </Grid>
                  ))}
                </Grid>
                <CardContent>
                  <Typography gutterBottom variant="h1" component="div">
                    {article.article_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {parse(
                      DOMPurify.sanitize(truncate(article.article_content, 500)),
                    )}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Tooltip title={article.article_fullmedia.media_name}>
                    <Chip
                      icon={
                        <MediaIcon
                          type={article.article_fullmedia.media_type}
                        />
                      }
                      classes={{ root: classes.media }}
                      variant="outlined"
                      label={article.article_fullmedia.media_name}
                    />
                  </Tooltip>
                </CardActions>
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
