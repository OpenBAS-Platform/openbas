import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@mui/styles';
import { Link, useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import { fetchPlayerMedia } from '../../../actions/Media';
import { useHelper } from '../../../store';
import { useQueryParameter } from '../../../utils/Environment';
import MediaNewspaper from './MediaNewspaper';
import MediaMicroblogging from './MediaMicroblogging';
import MediaTvChannel from './MediaTvChannel';
import Empty from '../../../components/Empty';
import { useFormatter } from '../../../components/i18n';
import { usePermissions } from '../../../utils/Exercise';
import { fetchMe } from '../../../actions/Application';
import { fetchMediaDocuments } from '../../../actions/Document';

const useStyles = makeStyles(() => ({
  root: {
    position: 'relative',
    flexGrow: 1,
    padding: 20,
  },
}));

const Media = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const [userId, articleId] = useQueryParameter(['user', 'article']);
  const { mediaId, exerciseId } = useParams();
  const { mediaReader } = useHelper((helper) => ({
    mediaReader: helper.getMediaReader(mediaId),
  }));
  const { media_information: media, media_exercise: exercise } = mediaReader ?? {};
  // Pass the full exercise because the exercise is never loaded in the store at this point
  const permissions = usePermissions(exerciseId, exercise);
  useEffect(() => {
    dispatch(fetchMe());
    dispatch(fetchPlayerMedia(exerciseId, mediaId, userId));
    dispatch(fetchMediaDocuments(exerciseId, userId));
  }, []);
  if (media) {
    return (
      <div className={classes.root}>
        {permissions.isLoggedIn && permissions.canRead && (
          <Button
            color="secondary"
            variant="outlined"
            component={Link}
            to={`/medias/${exerciseId}/${mediaId}?article=${articleId}&user=${userId}&preview=true`}
            style={{ position: 'absolute', top: 20, right: 20 }}
          >
            {t('Switch to preview mode')}
          </Button>
        )}
        {media.media_type === 'newspaper' && (
          <MediaNewspaper mediaReader={mediaReader} />
        )}
        {media.media_type === 'microblogging' && (
          <MediaMicroblogging mediaReader={mediaReader} />
        )}
        {media.media_type === 'tv' && (
          <MediaTvChannel mediaReader={mediaReader} />
        )}
      </div>
    );
  }
  return (
    <div className={classes.root}>
      {permissions.isLoggedIn && permissions.canRead && (
        <Button
          color="secondary"
          variant="outlined"
          component={Link}
          to={`/medias/${exerciseId}/${mediaId}?article=${articleId}&user=${userId}&preview=true`}
          style={{ position: 'fixed', top: 10, right: 10 }}
        >
          {t('Switch to preview mode')}
        </Button>
      )}
      <Empty
        message={t(
          'You are not a player in this exercise or you are not logged in.',
        )}
      />
    </div>
  );
};

export default Media;
