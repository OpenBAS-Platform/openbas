import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {
  CastForEducationOutlined,
  EmojiEventsOutlined,
} from '@mui/icons-material';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import Button from '@mui/material/Button';
import { Form } from 'react-final-form';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import AnimationMenu from '../AnimationMenu';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import {
  fetchExerciseInjects,
  fetchInjectTypes,
} from '../../../../actions/Inject';
import {
  fetchExerciseInjectExpectations,
  updateInjectExpectation,
} from '../../../../actions/Exercise';
import SearchFilter from '../../../../components/SearchFilter';
import TagsFilter from '../../../../components/TagsFilter';
import InjectIcon from '../injects/InjectIcon';
import Loader from '../../../../components/Loader';
import { useFormatter } from '../../../../components/i18n';
import ItemTags from '../../../../components/ItemTags';
import { fetchAudiences } from '../../../../actions/Audience';
import { fetchExerciseArticles, fetchMedias } from '../../../../actions/Media';
import { fetchExerciseChallenges } from '../../../../actions/Challenge';
import MediaIcon from '../../medias/MediaIcon';
import { TextField } from '../../../../components/TextField';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 50px 0',
  },
  item: {
    height: 40,
  },
  chipInList: {
    fontSize: 13,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    textTransform: 'uppercase',
    borderRadius: '0',
    width: 200,
  },
  bodyItem: {
    height: '100%',
    float: 'left',
    fontSize: 13,
  },
  bodyItemRight: {
    height: '100%',
    float: 'right',
    fontSize: 13,
  },
  points: {
    fontSize: 13,
    height: 20,
    backgroundColor: 'rgba(236, 64, 122, 0.08)',
    color: '#ec407a',
    border: '1px solid #ec407a',
  },
}));

const inlineStyles = {
  green: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    color: '#4caf50',
  },
  orange: {
    backgroundColor: 'rgba(255, 87, 34, 0.08)',
    color: '#ff5722',
  },
  grey: {
    backgroundColor: 'rgba(96, 125, 139, 0.08)',
    color: '#607d8b',
  },
};

const Validations = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { exerciseId } = useParams();
  const [tags, setTags] = useState([]);
  const { t, fndt } = useFormatter();
  const [keyword, setKeyword] = useState('');
  const [onlyManual, setOnlyManual] = useState(true);
  const [currentExpectation, setCurrentExpectation] = useState(null);
  const handleSearch = (value) => setKeyword(value);
  const handleAddTag = (value) => {
    if (value) {
      setTags(R.uniq(R.append(value, tags)));
    }
  };
  const handleRemoveTag = (value) => setTags(R.filter((n) => n.id !== value, tags));
  // Fetching data
  const {
    exercise,
    injectTypesMap,
    injectExpectations,
    injectsMap,
    audiencesMap,
    challengesMap,
    articlesMap,
    mediasMap,
  } = useHelper((helper) => {
    return {
      exercise: helper.getExercise(exerciseId),
      injectsMap: helper.getInjectsMap(),
      injectExpectations: helper.getExerciseInjectExpectations(exerciseId),
      injectTypesMap: helper.getInjectTypesMap(),
      audiencesMap: helper.getAudiencesMap(),
      challengesMap: helper.getChallengesMap(),
      articlesMap: helper.getArticlesMap(),
      mediasMap: helper.getMediasMap(),
    };
  });
  useDataLoader(() => {
    dispatch(fetchMedias());
    dispatch(fetchInjectTypes());
    dispatch(fetchExerciseInjectExpectations(exerciseId));
    dispatch(fetchExerciseInjects(exerciseId));
    dispatch(fetchAudiences(exerciseId));
    dispatch(fetchExerciseArticles(exerciseId));
    dispatch(fetchExerciseChallenges(exerciseId));
  });
  const validate = (values) => {
    const errors = {};
    const requiredFields = ['expectation_score'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  };
  const submit = (injectExpectationId, data) => dispatch(
    updateInjectExpectation(exerciseId, injectExpectationId, data),
  ).then(() => setCurrentExpectation(null));
  const filterByKeyword = (n) => keyword === ''
    || (n.inject_expectation_inject?.inject_title || '')
      .toLowerCase()
      .indexOf(keyword.toLowerCase()) !== -1
      || (n.inject_expectation_inject?.inject_description || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1;
  const sort = R.sortWith([R.descend(R.prop('inject_expectation_created_at'))]);
  const sortedInjectExpectations = R.pipe(
    R.uniqBy(R.prop('injectexpectation_id')),
    R.map((n) => R.assoc(
      'inject_expectation_inject',
      injectsMap[n.inject_expectation_inject] || {},
      n,
    )),
    R.filter((n) => (onlyManual
      ? !['openex_challenge', 'openex_media'].includes(
        n.inject_expectation_inject?.inject_type,
      )
      : n.injectexpectation_id !== null)),
    R.filter(
      (n) => tags.length === 0
      || R.any(
        (filter) => R.includes(filter, n.inject_expectation_inject?.inject_tags),
        R.pluck('id', tags),
      ),
    ),
    R.filter(filterByKeyword),
    sort,
  )(injectExpectations);
  const groupedExpectation = R.pipe(
    R.groupBy(R.path(['inject_expectation_inject', 'inject_id'])),
    R.toPairs,
    R.map((n) => {
      if (
        injectsMap[n[0]]?.inject_type === 'openex_media'
        || injectsMap[n[0]]?.inject_type === 'openex_challenge'
      ) {
        return [n[0], R.groupBy(R.prop('inject_expectation_audience'), n[1])];
      }
      return n;
    }),
    R.fromPairs,
  )(sortedInjectExpectations);
  // Rendering
  if (exercise && injectExpectations && !R.isEmpty(injectTypesMap)) {
    return (
      <div className={classes.container}>
        <AnimationMenu exerciseId={exerciseId} />
        <div style={{ float: 'left', marginRight: 20 }}>
          <SearchFilter
            small={true}
            onChange={handleSearch}
            keyword={keyword}
          />
        </div>
        <div style={{ float: 'left', marginRight: 20 }}>
          <TagsFilter
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            currentTags={tags}
          />
        </div>
        <div style={{ float: 'right' }}>
          <FormControlLabel
            control={
              <Switch
                checked={onlyManual}
                onChange={() => setOnlyManual(!onlyManual)}
              />
            }
            label={t('Only injects with manual validation')}
          />
        </div>
        <div className="clearfix" />
        <List>
          {Object.keys(groupedExpectation).map((injectId) => {
            const inject = injectsMap[injectId] || {};
            const injectContract = injectTypesMap[inject.inject_contract] || {};
            return (
              <div key={inject.inject_id}>
                <ListItem divider={true} classes={{ root: classes.item }}>
                  <ListItemIcon style={{ paddingTop: 5 }}>
                    <InjectIcon
                      tooltip={t(inject.inject_type || 'Unknown')}
                      config={injectContract.config}
                      type={inject.inject_type}
                      disabled={!inject.inject_enabled}
                      size="small"
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <div>
                        <div
                          className={classes.bodyItem}
                          style={{ width: '20%' }}
                        >
                          {inject.inject_title}
                        </div>
                        <div
                          className={classes.bodyItem}
                          style={{ width: '15%' }}
                        >
                          {fndt(inject.inject_sent_at)}
                        </div>
                        <div
                          className={classes.bodyItem}
                          style={{ width: '30%' }}
                        >
                          <ItemTags variant="list" tags={inject.inject_tags} />
                        </div>
                      </div>
                    }
                  />
                </ListItem>
                {inject.inject_type === 'openex_media'
                || inject.inject_type === 'openex_challenge' ? (
                  <List component="div" disablePadding>
                    {Object.keys(groupedExpectation[injectId]).map(
                      (audienceId) => {
                        const audience = audiencesMap[audienceId] || {};
                        return (
                          <div key={audience.audience_id}>
                            <ListItem
                              divider={true}
                              sx={{ pl: 4 }}
                              classes={{ root: classes.item }}
                            >
                              <ListItemIcon>
                                <CastForEducationOutlined fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <div>
                                    <div
                                      className={classes.bodyItem}
                                      style={{ width: '20%' }}
                                    >
                                      {audience.audience_name}
                                    </div>
                                  </div>
                                }
                              />
                            </ListItem>
                            <List component="div" disablePadding>
                              {inject.inject_type === 'openex_media'
                                && groupedExpectation[injectId][audienceId].map(
                                  (expectation) => {
                                    const article = articlesMap[
                                      expectation.inject_expectation_article
                                    ] || {};
                                    const media = mediasMap[article.article_media] || {};
                                    return (
                                      <ListItem
                                        key={audience.audience_id}
                                        divider={true}
                                        sx={{ pl: 8 }}
                                        classes={{ root: classes.item }}
                                      >
                                        <ListItemIcon>
                                          <MediaIcon
                                            type={media.media_type}
                                            variant="inline"
                                            size="small"
                                          />
                                        </ListItemIcon>
                                        <ListItemText
                                          primary={
                                            <div>
                                              <div
                                                className={classes.bodyItem}
                                                style={{ width: '20%' }}
                                              >
                                                {media.media_name}
                                              </div>
                                              <div
                                                className={classes.bodyItem}
                                                style={{ width: '30%' }}
                                              >
                                                {article.article_name}
                                              </div>
                                              <div
                                                className={
                                                  classes.bodyItemRight
                                                }
                                              >
                                                <Chip
                                                  classes={{
                                                    root: classes.chipInList,
                                                  }}
                                                  style={
                                                    expectation.inject_expectation_result
                                                      ? inlineStyles.green
                                                      : inlineStyles.grey
                                                  }
                                                  label={
                                                    expectation.inject_expectation_result
                                                      ? `${t('Validated')} (${
                                                        expectation.inject_expectation_score
                                                      })`
                                                      : t('Pending reading')
                                                  }
                                                />
                                              </div>
                                              <div
                                                className={
                                                  classes.bodyItemRight
                                                }
                                                style={{ marginRight: 20 }}
                                              >
                                                <Chip
                                                  classes={{
                                                    root: classes.points,
                                                  }}
                                                  label={
                                                    expectation.inject_expectation_expected_score
                                                  }
                                                />
                                              </div>
                                            </div>
                                          }
                                        />
                                      </ListItem>
                                    );
                                  },
                                )}
                              {inject.inject_type === 'openex_challenge'
                                && groupedExpectation[injectId][audienceId].map(
                                  (expectation) => {
                                    const challenge = challengesMap[
                                      expectation.inject_expectation_challenge
                                    ] || {};
                                    return (
                                      <ListItem
                                        key={challenge.challenge_id}
                                        divider={true}
                                        sx={{ pl: 8 }}
                                        classes={{ root: classes.item }}
                                      >
                                        <ListItemIcon>
                                          <EmojiEventsOutlined fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText
                                          primary={
                                            <div>
                                              <div
                                                className={classes.bodyItem}
                                                style={{ width: '20%' }}
                                              >
                                                {challenge.challenge_category}
                                              </div>
                                              <div
                                                className={classes.bodyItem}
                                                style={{ width: '30%' }}
                                              >
                                                {challenge.challenge_name}
                                              </div>

                                              <div
                                                className={
                                                  classes.bodyItemRight
                                                }
                                              >
                                                <Chip
                                                  classes={{
                                                    root: classes.chipInList,
                                                  }}
                                                  style={
                                                    expectation.inject_expectation_result
                                                      ? inlineStyles.green
                                                      : inlineStyles.grey
                                                  }
                                                  label={
                                                    expectation.inject_expectation_result
                                                      ? `${t('Validated')} (${
                                                        expectation.inject_expectation_score
                                                      })`
                                                      : t('Pending submission')
                                                  }
                                                />
                                              </div>
                                              <div
                                                className={
                                                  classes.bodyItemRight
                                                }
                                                style={{ marginRight: 20 }}
                                              >
                                                <Chip
                                                  classes={{
                                                    root: classes.points,
                                                  }}
                                                  label={
                                                    expectation.inject_expectation_expected_score
                                                  }
                                                />
                                              </div>
                                            </div>
                                          }
                                        />
                                      </ListItem>
                                    );
                                  },
                                )}
                            </List>
                          </div>
                        );
                      },
                    )}
                  </List>
                  ) : (
                  <List component="div" disablePadding>
                    {groupedExpectation[injectId].map((expectation) => {
                      const audience = audiencesMap[expectation.inject_expectation_audience]
                          || {};
                      return (
                        <ListItem
                          key={audience.audience_id}
                          divider={true}
                          sx={{ pl: 4 }}
                          classes={{ root: classes.item }}
                          button={true}
                          onClick={() => setCurrentExpectation(expectation)}
                        >
                          <ListItemIcon>
                            <CastForEducationOutlined fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <div>
                                <div
                                  className={classes.bodyItem}
                                  style={{ width: '20%' }}
                                >
                                  {audience.audience_name}
                                </div>
                                <div className={classes.bodyItemRight}>
                                  <Chip
                                    classes={{ root: classes.chipInList }}
                                    style={
                                      expectation.inject_expectation_result
                                        ? inlineStyles.green
                                        : inlineStyles.orange
                                    }
                                    label={
                                      expectation.inject_expectation_result
                                        ? `${t('Validated')} (${
                                          expectation.inject_expectation_score
                                        })`
                                        : t('Pending validation')
                                    }
                                  />
                                </div>
                                <div
                                  className={classes.bodyItemRight}
                                  style={{ marginRight: 20 }}
                                >
                                  <Chip
                                    classes={{
                                      root: classes.points,
                                    }}
                                    label={
                                      expectation.inject_expectation_expected_score
                                    }
                                  />
                                </div>
                              </div>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                  )}
              </div>
            );
          })}
        </List>
        <Dialog
          TransitionComponent={Transition}
          open={currentExpectation !== null}
          onClose={() => setCurrentExpectation(null)}
          fullWidth={true}
          maxWidth="md"
          PaperProps={{ elevation: 1 }}
        >
          <DialogTitle>
            {currentExpectation?.inject_expectation_inject?.inject_title}
          </DialogTitle>
          <DialogContent>
            <Grid container={true} spacing={3}>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('Title')}</Typography>
                {currentExpectation?.inject_expectation_inject?.inject_title}
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('Description')}</Typography>
                {
                  currentExpectation?.inject_expectation_inject
                    ?.inject_description
                }
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('Sent at')}</Typography>
                {fndt(
                  currentExpectation?.inject_expectation_inject?.inject_sent_at,
                )}
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('Tags')}</Typography>
                <ItemTags
                  tags={
                    currentExpectation?.inject_expectation_inject
                      ?.inject_tags || []
                  }
                />
              </Grid>
            </Grid>
            <Typography variant="h2" style={{ marginTop: 30 }}>
              {t('Results')}
            </Typography>
            <Form
              keepDirtyOnReinitialize={true}
              initialValues={{
                expectation_score:
                  currentExpectation?.inject_expectation_expected_score,
              }}
              onSubmit={(data) => submit(currentExpectation?.injectexpectation_id, data)
              }
              validate={validate}
              mutators={{
                setValue: ([field, value], state, { changeValue }) => {
                  changeValue(state, field, () => value);
                },
              }}
            >
              {({ handleSubmit, submitting, errors }) => (
                <form id="challengeForm" onSubmit={handleSubmit}>
                  <TextField
                    variant="standard"
                    type="number"
                    name="expectation_score"
                    fullWidth={true}
                    label={t('Score')}
                  />
                  <div style={{ float: 'right', marginTop: 20 }}>
                    <Button
                      onClick={() => setCurrentExpectation(null)}
                      style={{ marginRight: 10 }}
                      disabled={submitting}
                    >
                      {t('Cancel')}
                    </Button>
                    <Button
                      color="secondary"
                      type="submit"
                      disabled={submitting || Object.keys(errors).length > 0}
                    >
                      {t('Validate')}
                    </Button>
                  </div>
                </form>
              )}
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  return (
    <div className={classes.container}>
      <AnimationMenu exerciseId={exerciseId} />
      <Loader />
    </div>
  );
};

export default Validations;
