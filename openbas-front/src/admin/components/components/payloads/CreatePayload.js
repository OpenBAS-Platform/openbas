import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Fab } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Add } from '@mui/icons-material';
import { addPayload } from '../../../../actions/Payload';
import PayloadForm from './PayloadForm';
import inject18n from '../../../../components/i18n';
import Drawer from '../../../../components/common/Drawer';

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
      R.assoc('payload_tags', R.pluck('id', data.payload_tags)),
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
          title={t('Create a new payload')}
        >
          <PayloadForm
            editing={false}
            onSubmit={this.onSubmit.bind(this)}
            initialValues={{ payload_tags: [] }}
            handleClose={this.handleClose.bind(this)}
          />
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
