import { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Fab } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Add } from '@mui/icons-material';
import { addAttackPattern } from '../../../../actions/AttackPattern';
import AttackPatternForm from './AttackPatternForm';
import inject18n from '../../../../components/i18n';
import Drawer from '../../../../components/common/Drawer';

const styles = () => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 230,
  },
});

class CreateAttackPattern extends Component {
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
      .then((result) => {
        if (this.props.onCreate) {
          const attackPatternCreated = result.entities.attackpatterns[result.result];
          this.props.onCreate(attackPatternCreated);
        }
        return (result.result ? this.handleClose() : result);
      });
  }

  render() {
    const { classes, t } = this.props;
    return (
      <>
        <Fab
          onClick={this.handleOpen.bind(this)}
          color="primary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
        </Fab>
        <Drawer
          open={this.state.open}
          handleClose={this.handleClose.bind(this)}
          title={t('Create a new attack pattern')}
        >
          <AttackPatternForm
            editing={false}
            onSubmit={this.onSubmit.bind(this)}
            initialValues={{ attack_pattern_kill_chain_phases: [] }}
            handleClose={this.handleClose.bind(this)}
          />
        </Drawer>
      </>
    );
  }
}

CreateAttackPattern.propTypes = {
  t: PropTypes.func,
  organizations: PropTypes.array,
  addAttackPattern: PropTypes.func,
  onCreate: PropTypes.func,
};

export default R.compose(
  connect(null, { addAttackPattern }),
  inject18n,
  withStyles(styles),
)(CreateAttackPattern);
