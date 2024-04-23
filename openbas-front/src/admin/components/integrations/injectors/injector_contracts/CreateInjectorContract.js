import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Fab, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Add } from '@mui/icons-material';
import { addAttackPattern } from '../../../../../actions/AttackPattern';
import InjectorContractForm from './InjectorContractForm';
import inject18n from '../../../../../components/i18n';
import Transition from '../../../../../components/common/Transition';

const styles = () => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 230,
  },
});

class CreateInjectorContract extends Component {
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
      R.assoc('attack_pattern_kill_chain_phases', R.pluck('id', data.attack_pattern_kill_chain_phases)),
    )(data);
    return this.props
      .addAttackPattern(inputValues)
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
          <DialogTitle>{t('Create a new attack pattern')}</DialogTitle>
          <DialogContent>
            <InjectorContractForm
              editing={false}
              onSubmit={this.onSubmit.bind(this)}
              initialValues={{ attack_pattern_kill_chain_phases: [] }}
              handleClose={this.handleClose.bind(this)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

CreateInjectorContract.propTypes = {
  t: PropTypes.func,
  organizations: PropTypes.array,
  addAttackPattern: PropTypes.func,
};

export default R.compose(
  connect(null, { addAttackPattern }),
  inject18n,
  withStyles(styles),
)(CreateInjectorContract);
