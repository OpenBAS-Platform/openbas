import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import { IconButton, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { Add } from '@mui/icons-material';
import ObjectiveForm from './ObjectiveForm';
import { addObjective } from '../../../../../actions/Objective';
import inject18n from '../../../../../components/i18n';
import Transition from '../../../../../components/common/Transition';

const styles = () => ({
  createButton: {
    float: 'left',
    marginTop: -15,
  },
});

class CreateObjective extends Component {
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
      .addObjective(this.props.exerciseId, data)
      .then((result) => (result.result ? this.handleClose() : result));
  }

  render() {
    const { classes, t } = this.props;
    return (
      <div>
        <IconButton
          color="secondary"
          aria-label="Add"
          onClick={this.handleOpen.bind(this)}
          classes={{ root: classes.createButton }}
          size="large"
        >
          <Add fontSize="small" />
        </IconButton>
        <Dialog
          open={this.state.open}
          TransitionComponent={Transition}
          onClose={this.handleClose.bind(this)}
          fullWidth={true}
          maxWidth="md"
          PaperProps={{ elevation: 1 }}
        >
          <DialogTitle>{t('Create a new objective')}</DialogTitle>
          <DialogContent>
            <ObjectiveForm
              initialValues={{ objective_priority: 1 }}
              onSubmit={this.onSubmit.bind(this)}
              handleClose={this.handleClose.bind(this)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

CreateObjective.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  exerciseId: PropTypes.string,
  addObjective: PropTypes.func,
};

export default R.compose(
  connect(null, { addObjective }),
  inject18n,
  withStyles(styles),
)(CreateObjective);
