import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import { FormControlLabel, List, ListItem, ListItemIcon, ListItemText, Slide, Switch } from '@mui/material';
import { CastForEducationOutlined } from '@mui/icons-material';
import AnimationMenu from '../AnimationMenu';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchExerciseInjects, fetchInjectTypes } from '../../../../actions/Inject';
import { fetchExerciseInjectExpectations, fetchExerciseTeams } from '../../../../actions/Exercise';
import SearchFilter from '../../../../components/SearchFilter';
import Loader from '../../../../components/Loader';
import { useFormatter } from '../../../../components/i18n';
import { fetchExerciseArticles, fetchChannels } from '../../../../actions/Channel.js';
import { fetchExerciseChallenges } from '../../../../actions/Challenge';
import TagsFilter from '../../../../components/TagsFilter';
import InjectIcon from '../injects/InjectIcon';
import ItemTags from '../../../../components/ItemTags';
import ManualExpectations from './ManualExpectations';
import ChallengeExpectation from './ChallengeExpectation';
import ChannelExpectation from './ChannelExpectation';

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
  bodyItem: {
    height: '100%',
    float: 'left',
    fontSize: 13,
  },
}));

const Validations = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { exerciseId } = useParams();
  const [tags, setTags] = useState([]);
  const { t, fndt } = useFormatter();
  const [keyword, setKeyword] = useState('');
  const [onlyManual, setOnlyManual] = useState(true);
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
    teamsMap,
    challengesMap,
    articlesMap,
    channelsMap,
  } = useHelper((helper) => {
    return {
      exercise: helper.getExercise(exerciseId),
      injectsMap: helper.getInjectsMap(),
      injectExpectations: helper.getExerciseInjectExpectations(exerciseId),
      injectTypesMap: helper.getInjectTypesMap(),
      teamsMap: helper.getTeamsMap(),
      challengesMap: helper.getChallengesMap(),
      articlesMap: helper.getArticlesMap(),
      channelsMap: helper.getChannelsMap(),
    };
  });
  useDataLoader(() => {
    dispatch(fetchChannels());
    dispatch(fetchInjectTypes());
    dispatch(fetchExerciseInjectExpectations(exerciseId));
    dispatch(fetchExerciseInjects(exerciseId));
    dispatch(fetchExerciseTeams(exerciseId));
    dispatch(fetchExerciseArticles(exerciseId));
    dispatch(fetchExerciseChallenges(exerciseId));
  });
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
      ? n.inject_expectation_type === 'MANUAL'
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

  /* eslint-disable no-param-reassign */
  const groupedByInject = sortedInjectExpectations.reduce((group, expectation) => {
    const { inject_expectation_inject } = expectation;
    const { inject_id } = inject_expectation_inject;
    if (inject_id) {
      const values = group[inject_id] ?? [];
      values.push(expectation);
      group[inject_id] = values;
    }
    return group;
  }, {});

  const groupedByTeam = (injects) => {
    return injects.reduce((group, expectation) => {
      const { inject_expectation_team } = expectation;
      if (inject_expectation_team) {
        const values = group[inject_expectation_team] ?? [];
        values.push(expectation);
        group[inject_expectation_team] = values;
      }
      return group;
    }, {});
  };

  const groupedByExpectation = (expectations) => {
    return expectations.reduce((group, expectation) => {
      const { inject_expectation_type } = expectation;
      if (inject_expectation_type) {
        const values = group[inject_expectation_type] ?? [];
        values.push(expectation);
        group[inject_expectation_type] = values;
      }
      return group;
    }, {});
  };

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
          {Object.entries(groupedByInject).map(([injectId, teams]) => {
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
                        <div className={classes.bodyItem} style={{ width: '250px' }}>
                          {inject.inject_title}
                        </div>
                        <div className={classes.bodyItem} style={{ width: '15%' }}>
                          {fndt(inject.inject_sent_at)}
                        </div>
                        <div className={classes.bodyItem} style={{ width: '30%' }}>
                          <ItemTags variant="list" tags={inject.inject_tags} />
                        </div>
                      </div>
                    }
                  />
                </ListItem>
                <List component="div" disablePadding>
                  {Object.entries(groupedByTeam(teams)).map(([teamId, expectations]) => {
                    const team = teamsMap[teamId] || {};
                    return (
                      <div key={team.team_id}>
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
                              <div className={classes.bodyItem} style={{ width: '20%' }}>
                                {team.team_name}
                              </div>
                            }
                          />
                        </ListItem>
                        <List component="div" disablePadding>
                          {Object.entries(groupedByExpectation(expectations)).map(([expectationType, es]) => {
                            if (expectationType === 'ARTICLE') {
                              const expectation = es[0];
                              const article = articlesMap[expectation.inject_expectation_article] || {};
                              const channel = channelsMap[article.article_channel] || {};
                              return (
                                <ChannelExpectation key={expectationType} channel={channel} article={article} expectation={expectation} />
                              );
                            } if (expectationType === 'CHALLENGE') {
                              const expectation = es[0];
                              const challenge = challengesMap[expectation.inject_expectation_challenge] || {};
                              return (
                                <ChallengeExpectation key={expectationType} challenge={challenge} expectation={expectation} />
                              );
                            }
                            return (
                              <ManualExpectations key={expectationType} exerciseId={exerciseId} inject={inject} expectations={es} />
                            );
                          })}
                        </List>
                      </div>
                    );
                  })}
                </List>
              </div>
            );
          })}
        </List>
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
