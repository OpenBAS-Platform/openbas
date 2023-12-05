import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@mui/styles';
import { Link, useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import { fetchObserverMedia } from '../../../actions/Media';
import { useHelper } from '../../../store';
import { useQueryParameter } from '../../../utils/Environment';
import MediaNewspaper from './MediaNewspaper';
import MediaMicroblogging from './MediaMicroblogging';
import MediaTvChannel from './MediaTvChannel';
import { useFormatter } from '../../../components/i18n';
import { usePermissions } from '../../../utils/Exercise';
import { fetchMe } from '../../../actions/Application';
import { fetchPlayerDocuments } from '../../../actions/Document';
import Loader from '../../../components/Loader';

const useStyles = makeStyles(() => ({
  root: {
    position: 'relative',
    flexGrow: 1,
    padding: 20,
  },
}));

const MediaPreview = () => {
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
    dispatch(fetchObserverMedia(exerciseId, mediaId));
    dispatch(fetchPlayerDocuments(exerciseId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (media) {
    return (
      <div className={classes.root}>
        {permissions.isLoggedIn && permissions.canRead && (
          <Button
            color="secondary"
            variant="outlined"
            component={Link}
            to={`/medias/${exerciseId}/${mediaId}?article=${articleId}&user=${userId}&preview=false`}
            style={{ position: 'absolute', top: 20, right: 20 }}
          >
            {t('Switch to player mode')}
          </Button>
        )}
        {permissions.isLoggedIn && permissions.canRead && (
          <Button
            color="primary"
            variant="outlined"
            component={Link}
            to={`/admin/exercises/${exerciseId}/definition/media`}
            style={{ position: 'absolute', top: 20, left: 20 }}
          >
            {t('Back to administration')}
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
  return <Loader />;
};

export default MediaPreview;
