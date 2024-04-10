import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import { List, ListItem, ListItemIcon, ListItemText, Slide } from '@mui/material';
import AnimationMenu from '../AnimationMenu';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchExerciseInjects, fetchInjectTypes } from '../../../../actions/Inject';
import { fetchExerciseInjectExpectations } from '../../../../actions/Exercise';
import SearchFilter from '../../../../components/SearchFilter';
import Loader from '../../../../components/Loader';
import { useFormatter } from '../../../../components/i18n';
import TagsFilter from '../../../../components/TagsFilter';
import InjectIcon from '../../components/injects/InjectIcon';
import ItemTags from '../../../../components/ItemTags';
import TeamOrAssetLine from './teamsOrAssets/TeamOrAssetLine';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
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
  } = useHelper((helper) => {
    return {
      exercise: helper.getExercise(exerciseId),
      injectsMap: helper.getInjectsMap(),
      injectExpectations: helper.getExerciseInjectExpectations(exerciseId),
      injectTypesMap: helper.getInjectTypesMap(),
    };
  });
  useDataLoader(() => {
    dispatch(fetchInjectTypes());
    dispatch(fetchExerciseInjectExpectations(exerciseId));
    dispatch(fetchExerciseInjects(exerciseId));
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
    R.filter(((n) => R.isEmpty(n.inject_expectation_results))),
    R.map((n) => R.assoc(
      'inject_expectation_inject',
      injectsMap[n.inject_expectation_inject] || {},
      n,
    )),
    R.filter((n) => n.inject_expectation_type === 'MANUAL'),
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

  const groupedByTeamOrAsset = (expectations) => {
    return expectations.reduce((group, expectation) => {
      const { inject_expectation_team } = expectation;
      const { inject_expectation_asset } = expectation;
      const { inject_expectation_asset_group } = expectation;
      if (inject_expectation_team) {
        const values = group[inject_expectation_team] ?? [];
        values.push(expectation);
        group[inject_expectation_team] = values;
      }
      if (inject_expectation_asset && !expectation.inject_expectation_group) {
        const values = group[inject_expectation_asset] ?? [];
        values.push(expectation);
        group[inject_expectation_asset] = values;
      }
      if (inject_expectation_asset_group) {
        const values = group[inject_expectation_asset_group] ?? [];
        values.push(expectation);
        group[inject_expectation_asset_group] = values;
      }
      return group;
    }, {});
  };

  // Rendering
  if (exercise && injectExpectations && !R.isEmpty(injectTypesMap)) {
    return (
      <div className={classes.container}>
        <AnimationMenu exerciseId={exerciseId} />
        <div style={{ float: 'left', marginRight: 10 }}>
          <SearchFilter
            variant="small"
            onChange={handleSearch}
            keyword={keyword}
          />
        </div>
        <div style={{ float: 'left', marginRight: 10 }}>
          <TagsFilter
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            currentTags={tags}
          />
        </div>
        <div className="clearfix" />
        <List>
          {Object.entries(groupedByInject).map(([injectId, expectationsByInject]) => {
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
                  {Object.entries(groupedByTeamOrAsset(expectationsByInject)).map(([id, expectations]) => {
                    return (
                      <TeamOrAssetLine key={id} exerciseId={exerciseId} inject={inject} injectContract={injectContract}
                        expectationsByInject={expectationsByInject} id={id} expectations={expectations}
                      />
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
