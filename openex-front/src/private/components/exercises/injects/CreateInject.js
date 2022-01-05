import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Slide from '@mui/material/Slide';
import withStyles from '@mui/styles/withStyles';
import { Add } from '@mui/icons-material';
import { addInject } from '../../../../actions/Inject';
import InjectForm from './InjectForm';
import inject18n from '../../../../components/i18n';

const styles = (theme) => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class CreateInject extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  onSubmit(data) {
    const inputValues = R.pipe(
      R.assoc(
        'inject_depends_duration',
        data.inject_depends_duration_days * 3600 * 24
          + data.inject_depends_duration_hours * 3600
          + data.inject_depends_duration_minutes * 60
          + data.inject_depends_duration_seconds,
      ),
      R.assoc('inject_tags', R.pluck('id', data.inject_tags)),
      R.assoc('inject_tags', R.pluck('id', data.inject_tags)),
      R.dissoc('inject_depends_duration_days'),
      R.dissoc('inject_depends_duration_hours'),
      R.dissoc('inject_depends_duration_minutes'),
      R.dissoc('inject_depends_duration_seconds'),
    )(data);
    return this.props
      .addInject(this.props.exerciseId, inputValues)
      .then((result) => {
        if (result.result) {
          return this.handleClose();
        }
        return result;
      });
  }

  render() {
    const { classes, t, injectTypes } = this.props;
    return (
      <div>
        <Fab
          onClick={this.handleOpen.bind(this)}
          color="primary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
        </Fab>
        <Dialog
          open={this.state.open}
          TransitionComponent={Transition}
          onClose={this.handleClose.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>{t('Create a new inject')}</DialogTitle>
          <DialogContent>
            <InjectForm
              editing={false}
              onSubmit={this.onSubmit.bind(this)}
              initialValues={{
                inject_tags: [],
                inject_depends_duration_days: 0,
                inject_depends_duration_hours: 0,
                inject_depends_duration_minutes: 0,
                inject_depends_duration_seconds: 0,
              }}
              handleClose={this.handleClose.bind(this)}
              injectTypes={injectTypes}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

CreateInject.propTypes = {
  t: PropTypes.func,
  exerciseId: PropTypes.string,
  addInject: PropTypes.func,
  injectTypes: PropTypes.array,
};

export default R.compose(
  connect(null, { addInject }),
  inject18n,
  withStyles(styles),
)(CreateInject);
