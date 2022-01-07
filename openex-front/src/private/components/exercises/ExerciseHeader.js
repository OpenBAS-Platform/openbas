import React, { useState } from 'react';
import * as R from 'ramda';
import { makeStyles } from '@mui/styles';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import {
  AddOutlined,
  CloseOutlined,
  DoneOutlined,
  MoreVertRounded,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { Form } from 'react-final-form';
import { useParams } from 'react-router-dom';
import { updateExerciseTags } from '../../../actions/Exercise';
import TagField from '../../../components/TagField';
import ExercisePopover from './ExercisePopover';
import { useStore } from '../../../store';
import { useFormatter } from '../../../components/i18n';

const useStyles = makeStyles(() => ({
  container: {
    width: '100%',
    paddingBottom: 50,
  },
  title: {
    float: 'left',
    textTransform: 'uppercase',
  },
  tags: {
    overflow: 'hidden',
    float: 'right',
  },
  tag: {
    overflow: 'hidden',
    marginRight: 7,
  },
  tagsInput: {
    overflow: 'hidden',
    width: 300,
    margin: '0 10px 0 10px',
    float: 'right',
  },
}));

const ExerciseHeader = () => {
  const classes = useStyles();
  const { t } = useFormatter();
  const { exerciseId } = useParams();
  const dispatch = useDispatch();
  const exercise = useStore((store) => store.getExercise(exerciseId));
  const [openTags, setOpenTags] = useState(false);
  const [openTagAdd, setOpenTagAdd] = useState(false);

  const handleToggleAddTag = () => setOpenTagAdd(!openTagAdd);
  const handleToggleOpenTags = () => setOpenTags(!openTags);

  const deleteTag = (tagId) => {
    const tags = exercise.tags.filter((tag) => tag.tag_id !== tagId);
    dispatch(
      updateExerciseTags(exercise.exercise_id, {
        exercise_tags: tags.map((tag) => tag.tag_id),
      }),
    );
  };
  const submitTags = (values) => {
    handleToggleAddTag();
    dispatch(
      updateExerciseTags(exercise.exercise_id, {
        exercise_tags: R.uniq([
          ...values.exercise_tags.map((tag) => tag.id),
          ...exercise.tags.map((tag) => tag.tag_id),
        ]),
      }),
    );
  };

  const { tags } = exercise;
  return (
    <div className={classes.container}>
      <Typography
        variant="h5"
        gutterBottom={true}
        classes={{ root: classes.title }}
      >
        {exercise.exercise_name}
      </Typography>
      <ExercisePopover exercise={exercise} />
      <div className={classes.tags}>
        {R.take(5, tags).map((tag) => (
          <Chip
            key={tag.tag_id}
            classes={{ root: classes.tag }}
            label={tag.tag_name}
            onDelete={() => deleteTag(tag.tag_id)}
          />
        ))}
        {tags.length > 5 ? (
          <Button
            color="primary"
            aria-label="More"
            onClick={handleToggleOpenTags}
            style={{ fontSize: 14 }}
          >
            <MoreVertRounded />
            &nbsp;&nbsp;{t('More')}
          </Button>
        ) : (
          <div style={{ float: 'left', marginTop: -5 }}>
            {openTagAdd && (
              <IconButton
                style={{ float: 'left' }}
                color="primary"
                aria-label="Tag"
                type="submit"
                form="tagsForm"
              >
                <DoneOutlined />
              </IconButton>
            )}
            <IconButton
              style={{ float: 'left' }}
              color="primary"
              aria-label="Tag"
              onClick={handleToggleAddTag}
            >
              {openTagAdd ? <CloseOutlined /> : <AddOutlined />}
            </IconButton>
          </div>
        )}
        <Slide
          direction="left"
          in={openTagAdd}
          mountOnEnter={true}
          unmountOnExit={true}
        >
          <div className={classes.tagsInput}>
            <Form
              keepDirtyOnReinitialize={true}
              initialValues={{ exercise_tags: [] }}
              onSubmit={submitTags}
              mutators={{
                setValue: ([field, value], state, { changeValue }) => {
                  changeValue(state, field, () => value);
                },
              }}
            >
              {({ handleSubmit, form, values }) => (
                <form id="tagsForm" onSubmit={handleSubmit}>
                  <TagField
                    name="exercise_tags"
                    values={values}
                    label={null}
                    placeholder={t('Tags')}
                    setFieldValue={form.mutators.setValue}
                  />
                </form>
              )}
            </Form>
          </div>
        </Slide>
      </div>
    </div>
  );
};

export default ExerciseHeader;
