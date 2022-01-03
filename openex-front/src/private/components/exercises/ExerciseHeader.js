import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import {
  MoreVertRounded,
  AddOutlined,
  CloseOutlined,
  DoneOutlined,
} from '@mui/icons-material';
import { connect } from 'react-redux';
import { Form } from 'react-final-form';
import inject18n from '../../../components/i18n';
import { updateExerciseTags } from '../../../actions/Exercise';
import TagField from '../../../components/TagField';

const styles = () => ({
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
});

class ExerciseHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openTagAdd: false,
      openTags: false,
    };
  }

  handleToggleAddTag() {
    this.setState({ openTagAdd: !this.state.openTagAdd });
  }

  handleToggleOpenTags() {
    this.setState({ openTags: !this.state.openTags });
  }

  deleteTag(tagId) {
    const { exercise } = this.props;
    const exerciseTags = exercise.getTags();
    const tags = exerciseTags.filter((t) => t.tag_id !== tagId);
    return this.props.updateExerciseTags(exercise.exercise_id, {
      exercise_tags: tags.map((t) => t.tag_id),
    });
  }

  submitTags(values) {
    const { exercise } = this.props;
    const exerciseTags = exercise.getTags();
    this.handleToggleAddTag();
    return this.props.updateExerciseTags(exercise.exercise_id, {
      exercise_tags: R.uniq([
        ...values.exercise_tags.map((t) => t.id),
        ...exerciseTags.map((t) => t.tag_id),
      ]),
    });
  }

  render() {
    const { classes, exercise, t } = this.props;
    const tags = exercise.getTags();
    return (
      <div className={classes.container}>
        <Typography
          variant="h5"
          gutterBottom={true}
          classes={{ root: classes.title }}
        >
          {exercise.exercise_name}
        </Typography>
        <div className={classes.tags}>
          {R.take(5, tags).map((tag) => (
            <Chip
              key={tag.tag_id}
              classes={{ root: classes.tag }}
              label={tag.tag_name}
              onDelete={this.deleteTag.bind(this, tag.tag_id)}
            />
          ))}
          {tags.length > 5 ? (
            <Button
              color="primary"
              aria-label="More"
              onClick={this.handleToggleOpenTags.bind(this)}
              style={{ fontSize: 14 }}
            >
              <MoreVertRounded />
              &nbsp;&nbsp;{t('More')}
            </Button>
          ) : (
            <div style={{ float: 'left', marginTop: -5 }}>
              {this.state.openTagAdd && (
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
                onClick={this.handleToggleAddTag.bind(this)}
              >
                {this.state.openTagAdd ? <CloseOutlined /> : <AddOutlined />}
              </IconButton>
            </div>
          )}
          <Slide
            direction="left"
            in={this.state.openTagAdd}
            mountOnEnter={true}
            unmountOnExit={true}
          >
            <div className={classes.tagsInput}>
              <Form
                keepDirtyOnReinitialize={true}
                initialValues={{ exercise_tags: [] }}
                onSubmit={this.submitTags.bind(this)}
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
  }
}

ExerciseHeader.propTypes = {
  t: PropTypes.func,
  nsdt: PropTypes.func,
  exercise: PropTypes.object,
  updateExerciseTags: PropTypes.func,
};

export default R.compose(
  connect(null, { updateExerciseTags }),
  withStyles(styles),
  inject18n,
)(ExerciseHeader);
