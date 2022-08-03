import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { CastForEducationOutlined } from '@mui/icons-material';
import AnimationMenu from '../AnimationMenu';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import {
  fetchExerciseInjects,
  fetchInjectTypes,
} from '../../../../actions/Inject';
import { fetchExerciseInjectExpectations } from '../../../../actions/Exercise';
import SearchFilter from '../../../../components/SearchFilter';
import TagsFilter from '../../../../components/TagsFilter';
import InjectIcon from '../injects/InjectIcon';
import Loader from '../../../../components/Loader';
import { useFormatter } from '../../../../components/i18n';
import ItemTags from '../../../../components/ItemTags';
import { fetchAudiences } from '../../../../actions/Audience';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 50px 0',
  },
}));

const Validations = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { exerciseId } = useParams();
  const [tags, setTags] = useState([]);
  const { t } = useFormatter();
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
    audiencesMap,
  } = useHelper((helper) => {
    return {
      exercise: helper.getExercise(exerciseId),
      injectsMap: helper.getInjectsMap(),
      injectExpectations: helper.getExerciseInjectExpectations(exerciseId),
      injectTypesMap: helper.getInjectTypesMap(),
      audiencesMap: helper.getAudiencesMap(),
    };
  });
  useDataLoader(() => {
    dispatch(fetchInjectTypes());
    dispatch(fetchExerciseInjectExpectations(exerciseId));
    dispatch(fetchExerciseInjects(exerciseId));
    dispatch(fetchAudiences(exerciseId));
  });
  const groupedExpectation = R.groupBy(
    R.prop('inject_expectation_inject'),
    injectExpectations,
  );
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
        <div className="clearfix" />
        <List>
          {Object.keys(groupedExpectation).map((injectId) => {
            const inject = injectsMap[injectId] || {};
            const injectContract = inject
              ? injectTypesMap[inject.inject_contract]
              : {};
            return (
              <div>
                <ListItem key={inject.inject_id} divider={true}>
                  <ListItemIcon style={{ paddingTop: 5 }}>
                    <InjectIcon
                      tooltip={t(inject.inject_type || 'Unknown')}
                      config={injectContract?.config}
                      type={inject.inject_type}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={inject.inject_title}
                    secondary={inject.inject_description || t('No description')}
                  />
                  <ItemTags variant="list" tags={inject.inject_tags} />
                </ListItem>
                <List component="div" disablePadding>
                  {groupedExpectation[injectId].map((expectation) => {
                    const audience = audiencesMap[expectation.inject_expectation_audience]
                      || {};
                    return (
                      <ListItem
                        key={audience.audience_id}
                        divider={true}
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon style={{ paddingTop: 5 }}>
                          <CastForEducationOutlined />
                        </ListItemIcon>
                        <ListItemText
                          primary={audience.audience_name}
                          secondary={
                            inject.inject_description || t('No description')
                          }
                        />
                        <ItemTags variant="list" tags={inject.inject_tags} />
                      </ListItem>
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
