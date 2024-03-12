import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Fab, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Add } from '@mui/icons-material';
import { addKillChainPhase } from '../../../../actions/KillChainPhase';
import KillChainPhaseForm from './KillChainPhaseForm';
import inject18n from '../../../../components/i18n';
import Transition from '../../../../components/common/Transition';

const styles = () => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 230,
  },
});

class CreateKillChainPhase extends Component {
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
      .addKillChainPhase(data)
      .then((result) => (result.result ? this.handleClose() : result));
  }

  render() {
    const { classes, t } = this.props;
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
          PaperProps={{ elevation: 1 }}
        >
          <DialogTitle>{t('Create a new kill chain phase')}</DialogTitle>
          <DialogContent>
            <KillChainPhaseForm
              editing={false}
              onSubmit={this.onSubmit.bind(this)}
              handleClose={this.handleClose.bind(this)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

CreateKillChainPhase.propTypes = {
  t: PropTypes.func,
  addKillChainPhase: PropTypes.func,
};

const select = (state) => ({
  organizations: state.referential.entities.organizations,
});

export default R.compose(
  connect(select, { addKillChainPhase }),
  inject18n,
  withStyles(styles),
)(CreateKillChainPhase);
