import React from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormatter } from '../../../../components/i18n';
import { useStore } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchAudiences } from '../../../../actions/Audience';
import Empty from '../../../../components/Empty';
import SearchFilter from '../../../../components/SearchFilter';
import TagsFilter from '../../../../components/TagsFilter';
import useSearchAnFilter from '../../../../utils/SortingFiltering';

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    flexGrow: 1,
    paddingBottom: 50,
  },
  timeline: {
    marginTop: 20,
    width: '100%',
  },
  line: {
    width: '100%',
    height: 60,
    lineHeight: '60px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
    verticalAlign: 'middle',
  },
  name: {
    fontSize: 14,
    fontWeight: 600,
    width: 150,
  },
}));

const Animation = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { exerciseId } = useParams();
  const { t } = useFormatter();
  const exercise = useStore((store) => store.getExercise(exerciseId));
  const { audiences } = exercise;
  useDataLoader(() => {
    dispatch(fetchAudiences(exerciseId));
  });
  // Filter and sort hook
  const searchColumns = ['title', 'description', 'content'];
  const filtering = useSearchAnFilter(
    'inject',
    'depends_duration',
    searchColumns,
  );
  return (
    <div className={classes.root}>
      <div className={classes.parameters}>
        <div style={{ float: 'left', marginRight: 20 }}>
          <SearchFilter
            small={true}
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
        </div>
        <div style={{ float: 'left', marginRight: 20 }}>
          <TagsFilter
            onAddTag={filtering.handleAddTag}
            onRemoveTag={filtering.handleRemoveTag}
            currentTags={filtering.tags}
          />
        </div>
      </div>
      <div className="clearfix" />
      {audiences.length > 0 ? (
        <div className={classes.timeline}>
          {audiences.map((audience) => (
            <div key={audience.audience_id} className={classes.line}>
              <div className={classes.name}>{audience.audience_name}</div>
            </div>
          ))}
          <div className={classes.scale}>

          </div>
        </div>
      ) : (
        <Empty message={t('No audiences in this exercise.')} />
      )}
    </div>
  );
};

export default Animation;
