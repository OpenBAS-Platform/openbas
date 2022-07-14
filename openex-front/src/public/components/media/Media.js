import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@mui/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import { useParams } from 'react-router-dom';
import { fetchMedia } from '../../../actions/Comcheck';
import { useHelper } from '../../../store';

const useStyles = makeStyles(() => ({
  container: {
    textAlign: 'center',
    margin: '0 auto',
    width: 500,
  },
  content: {
    width: '100%',
    padding: 20,
  },
  appBar: {
    textAlign: 'center',
  },
  comcheck: {
    borderRadius: '10px',
    paddingBottom: '15px',
  },
  logo: {
    width: 200,
    margin: '0px 0px 50px 0px',
  },
  subtitle: {
    width: '100%',
    color: '#ffffff',
    fontWeight: 400,
    fontSize: 18,
    textAlign: 'center',
  },
}));

const Media = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  // const { fldt, t } = useFormatter();
  const { mediaId, userId, exerciseId } = useParams();
  const mediaReader = useHelper((helper) => helper.getMediaReader(mediaId));
  const {
    exercise_status: status,
    media_articles: articles,
    media_information: info,
  } = mediaReader ?? {};
  useEffect(() => {
    dispatch(fetchMedia(mediaId, userId, exerciseId));
  }, []);
  return (
    <div className={classes.container}>
      <Paper variant="outlined">
        <AppBar color="primary" position="relative" className={classes.appBar}>
          <Toolbar>
            <div className={classes.subtitle}>
              {info?.media_name} ({status})
            </div>
          </Toolbar>
        </AppBar>
        <div className={classes.content}>
          <ul>
            {(articles ?? []).map((article) => (
              <li key={article.article_id}>{article.article_name}</li>
            ))}
          </ul>
        </div>
      </Paper>
    </div>
  );
};

export default Media;
