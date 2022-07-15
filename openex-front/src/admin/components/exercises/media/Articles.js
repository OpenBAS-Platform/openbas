import React from 'react';
import { makeStyles } from '@mui/styles';
import List from '@mui/material/List';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { NewspaperOutlined } from '@mui/icons-material';
import DefinitionMenu from '../DefinitionMenu';
import { isExerciseUpdatable } from '../../../../utils/Exercise';
import { useHelper } from '../../../../store';
import CreateArticle from './CreateArticle';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchExerciseArticles, fetchMedias } from '../../../../actions/Media';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import SearchFilter from '../../../../components/SearchFilter';
import ArticlePopover from './ArticlePopover';
import { useFormatter } from '../../../../components/i18n';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
}));

const headerStyles = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  article_name: {
    float: 'left',
    width: '50%',
    fontSize: 12,
    fontWeight: '700',
  },
  article_type: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  article_scheduled: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  article_name: {
    float: 'left',
    width: '50%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  article_media: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  article_scheduled: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const Articles = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  // Fetching data
  const { exerciseId } = useParams();
  const { exercise, articles, mediasMap } = useHelper((helper) => ({
    exercise: helper.getExercise(exerciseId),
    mediasMap: helper.getMediasMap(),
    articles: helper.getExerciseArticles(exerciseId),
  }));
  useDataLoader(() => {
    dispatch(fetchExerciseArticles(exerciseId));
    dispatch(fetchMedias());
  });
  // Filter and sort hook
  const searchColumns = ['name', 'type', 'content'];
  const filtering = useSearchAnFilter('article', 'name', searchColumns);
  // Rendering
  const fullArticles = articles.map((item) => ({
    ...item,
    article_type: mediasMap[item.article_media]?.media_name,
  }));
  const sortedArticles = filtering.filterAndSort(fullArticles);
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
      </div>
      <div className="clearfix" />
      <List style={{ marginTop: 10 }}>
        <ListItem classes={{ root: classes.itemHead }} divider={false} style={{ paddingTop: 0 }}>
          <ListItemIcon>
            <span style={{ padding: '0 8px 0 10px', fontWeight: 700, fontSize: 12 }}>#</span>
          </ListItemIcon>
          <ListItemText
            primary={
              <div>
                <div>{filtering.buildHeader('article_name', 'Name', true, headerStyles)}</div>
                <div>{filtering.buildHeader('article_type', 'Media', true, headerStyles)}</div>
                <div>{filtering.buildHeader('article_scheduled', 'Scheduled?', true, headerStyles)}</div>
              </div>
            }
          />
          <ListItemSecondaryAction>&nbsp;</ListItemSecondaryAction>
        </ListItem>
        {sortedArticles.map((article) => (
          <ListItem key={article.article_id} classes={{ root: classes.item }} divider={true}>
            <ListItemIcon>
              <NewspaperOutlined />
            </ListItemIcon>
            <ListItemText
              primary={
                <div>
                  <div className={classes.bodyItem} style={inlineStyles.article_name}>{article.article_name}</div>
                  <div className={classes.bodyItem} style={inlineStyles.article_media}>{article.article_type}</div>
                  <div className={classes.bodyItem} style={inlineStyles.article_scheduled}>
                    {article.article_is_scheduled ? t('Yes') : t('No')}
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <ArticlePopover article={article} />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      {isExerciseUpdatable(exercise) && (
        <CreateArticle exerciseId={exerciseId} />
      )}
    </div>
  );
};

export default Articles;
