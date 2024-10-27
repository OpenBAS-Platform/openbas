import { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Fab } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Add } from '@mui/icons-material';
import { addMitigation } from '../../../actions/Mitigation';
import MitigationForm from './MitigationForm';
import inject18n from '../../../components/i18n';
import Drawer from '../../../components/common/Drawer';

const styles = () => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
});

class CreateMitigation extends Component {
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
      R.assoc('mitigation_attack_patterns', R.pluck('id', data.mitigation_attack_patterns)),
    )(data);
    return this.props
      .addMitigation(inputValues)
      .then((result) => {
        if (this.props.onCreate) {
          const mitigationCreated = result.entities.mitigations[result.result];
          this.props.onCreate(mitigationCreated);
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
          title={t('Create a new mitigation')}
        >
          <MitigationForm
            editing={false}
            onSubmit={this.onSubmit.bind(this)}
            initialValues={{ mitigation_attack_patterns: [] }}
            handleClose={this.handleClose.bind(this)}
          />
        </Drawer>
      </>
    );
  }
}

CreateMitigation.propTypes = {
  t: PropTypes.func,
  organizations: PropTypes.array,
  addMitigation: PropTypes.func,
  onCreate: PropTypes.func,
};

export default R.compose(
  connect(null, { addMitigation }),
  inject18n,
  withStyles(styles),
)(CreateMitigation);
