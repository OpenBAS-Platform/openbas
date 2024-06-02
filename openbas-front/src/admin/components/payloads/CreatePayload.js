import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Fab, List, ListItemButton, ListItemIcon, ListItemText, Step, StepLabel, Stepper } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Add } from '@mui/icons-material';
import { Console } from 'mdi-material-ui';
import { addPayload } from '../../../actions/Payload';
import PayloadForm from './PayloadForm';
import inject18n from '../../../components/i18n';
import Drawer from '../../../components/common/Drawer';

const styles = () => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
});

class CreatePayload extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false, activeStep: 0, selectedType: null };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false, activeStep: 0, selectedType: null });
  }

  handleSelectType(type) {
    this.setState({ selectedType: type, activeStep: 1 });
  }

  onSubmit(data) {
    const inputValues = R.pipe(
      R.assoc('payload_type', this.state.selectedType),
      R.assoc('payload_platforms', R.pluck('id', data.payload_platforms)),
      R.assoc('payload_tags', R.pluck('id', data.payload_tags)),
      R.assoc('payload_attack_patterns', R.pluck('id', data.payload_attack_patterns)),
    )(data);
    return this.props
      .addPayload(inputValues)
      .then((result) => {
        if (this.props.onCreate) {
          const payloadCreated = result.entities.payloads[result.result];
          this.props.onCreate(payloadCreated);
        }
        return (result.result ? this.handleClose() : result);
      });
  }

  renderTypes() {
    const { t } = this.props;
    return (
      <List>
        <ListItemButton
          divider={true}
          onClick={this.handleSelectType.bind(this, 'Command')}
        >
          <ListItemIcon color="primary">
            <Console color="primary" />
          </ListItemIcon>
          <ListItemText primary={t('Command Line')} />
        </ListItemButton>
      </List>
    );
  }

  render() {
    const { classes, t } = this.props;
    const { open, activeStep, selectedType } = this.state;
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
          open={open}
          handleClose={this.handleClose.bind(this)}
          title={t('Create a new payload')}
        >
          <>
            <Stepper activeStep={activeStep} style={{ marginBottom: 20 }}>
              <Step>
                <StepLabel >{t('Select the type')}</StepLabel>
              </Step>
              <Step>
                <StepLabel >{t('Create the payload')}</StepLabel>
              </Step>
            </Stepper>
            {activeStep === 0 && this.renderTypes()}
            {activeStep === 1 && (
            <PayloadForm
              editing={false}
              onSubmit={this.onSubmit.bind(this)}
              initialValues={{ payload_tags: [], payload_platforms: [], payload_attack_patterns: [] }}
              handleClose={this.handleClose.bind(this)}
              type={selectedType}
            />
            )}
          </>
        </Drawer>
      </>
    );
  }
}

CreatePayload.propTypes = {
  t: PropTypes.func,
  organizations: PropTypes.array,
  addPayload: PropTypes.func,
  onCreate: PropTypes.func,
};

export default R.compose(
  connect(null, { addPayload }),
  inject18n,
  withStyles(styles),
)(CreatePayload);
