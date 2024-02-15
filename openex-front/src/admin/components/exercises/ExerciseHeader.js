import React, { useRef, useState } from 'react';
import * as R from 'ramda';
import { makeStyles } from '@mui/styles';
import { Button, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { Form } from 'react-final-form';
import { useParams } from 'react-router-dom';
import { updateExerciseTags } from '../../../actions/Exercise';
import TagField from '../../../components/TagField';
import ExercisePopover from './ExercisePopover';
import { useHelper } from '../../../store';
import { useFormatter } from '../../../components/i18n';
import Transition from '../../../components/common/Transition';
import { usePermissions } from '../../../utils/Exercise';
import TagChip from "../components/tags/TagChip";

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2)
  },
  containerTitle: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  title: {
    textTransform: 'uppercase',
    marginBottom: 0,
  },
}));

const ExerciseHeader = () => {
  const classes = useStyles();
  const { t } = useFormatter();
  const { exerciseId } = useParams();
  const permissions = usePermissions(exerciseId);
  const dispatch = useDispatch();
  const { exercise, tagsMap } = useHelper((helper) => {
    return {
      exercise: helper.getExercise(exerciseId),
      tagsMap: helper.getTagsMap(),
    };
  });
  const [openTagAdd, setOpenTagAdd] = useState(false);
  const containerRef = useRef(null);
  const handleToggleAddTag = () => setOpenTagAdd(!openTagAdd);

  const deleteTag = (tagId) => {
    const tagIds = exercise.exercise_tags.filter((id) => id !== tagId);
    dispatch(
      updateExerciseTags(exercise.exercise_id, {
        exercise_tags: tagIds,
      }),
    );
  };
  const submitTags = (values) => {
    handleToggleAddTag();
    dispatch(
      updateExerciseTags(exercise.exercise_id, {
        exercise_tags: R.uniq([
          ...values.exercise_tags.map((tag) => tag.id),
          ...exercise.exercise_tags,
        ]),
      }),
    );
  };
  const { exercise_tags: tags } = exercise;
  return (
    <div className={classes.container}>
      <div className={classes.containerTitle}>
        <Typography
          variant="h1"
          gutterBottom
          classes={{ root: classes.title }}
        >
          {exercise.exercise_name}
        </Typography>
        <ExercisePopover exercise={exercise} tagsMap={tagsMap} />
      </div>
      <div>
        <IconButton
          color="primary"
          aria-label="Tag"
          onClick={handleToggleAddTag}
          disabled={permissions.readOnlyBypassStatus}
        >
          <AddOutlined />
        </IconButton>
        <Dialog
          TransitionComponent={Transition}
          open={openTagAdd}
          onClose={handleToggleAddTag}
          fullWidth
          maxWidth="xs"
          PaperProps={{ elevation: 1 }}
        >
          <DialogTitle>{t('Add tags to this exercise')}</DialogTitle>
          <DialogContent>
            <Form
              keepDirtyOnReinitialize
              initialValues={{ exercise_tags: [] }}
              onSubmit={submitTags}
              mutators={{
                setValue: ([field, value], state, { changeValue }) => {
                  changeValue(state, field, () => value);
                },
              }}
            >
              {({ handleSubmit, values, submitting, pristine }) => (
                <form id="tagsForm" onSubmit={handleSubmit}>
                  <TagField
                    name="exercise_tags"
                    values={values}
                    label={null}
                    placeholder={t('Tags')}
                  />
                  <div style={{ float: 'right', marginTop: 20 }}>
                    <Button
                      onClick={handleToggleAddTag}
                      disabled={submitting}
                      style={{ marginRight: 10 }}
                    >
                      {t('Cancel')}
                    </Button>
                    <Button
                      color="secondary"
                      type="submit"
                      disabled={pristine || submitting}
                    >
                      {t('Add')}
                    </Button>
                  </div>
                </form>
              )}
            </Form>
          </DialogContent>
        </Dialog>
        {R.take(5, tags ?? []).map((tag) => (
          <TagChip
            key={tag}
            tagId={tag}
            isReadOnly={permissions.readOnlyBypassStatus}
            deleteTag={deleteTag}
          />
        ))}
      </div>
    </div>
  );
};

export default ExerciseHeader;
