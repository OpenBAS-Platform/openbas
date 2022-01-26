import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import withStyles from '@mui/styles/withStyles';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Add } from '@mui/icons-material';
import PollForm from './PollForm';
import { addPoll } from '../../../../actions/Poll';
import inject18n from '../../../../components/i18n';
import { Transition } from '../../../../utils/Environment';

const styles = () => ({
  createButton: {
    float: 'left',
    marginTop: -6,
  },
});

class CreatePoll extends Component {
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
    return this.props
      .addPoll(this.props.exerciseId, data)
      .then((result) => (result.result ? this.handleClose() : result));
  }

  render() {
    const { classes, t } = this.props;
    return (
      <div>
        <IconButton
          onClick={this.handleOpen.bind(this)}
          color="primary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add color="secondary" />
        </IconButton>
        <Dialog
          open={this.state.open}
          TransitionComponent={Transition}
          onClose={this.handleClose.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>{t('Create a new poll')}</DialogTitle>
          <DialogContent>
            <PollForm
              initialValues={{ poll_priority: 1 }}
              onSubmit={this.onSubmit.bind(this)}
              handleClose={this.handleClose.bind(this)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

CreatePoll.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  exerciseId: PropTypes.string,
  addPoll: PropTypes.func,
};

export default R.compose(
  connect(null, { addPoll }),
  inject18n,
  withStyles(styles),
)(CreatePoll);
