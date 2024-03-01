import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Dialog, DialogTitle, DialogContent, Fab } from '@mui/material';
import { Add } from '@mui/icons-material';
import withStyles from '@mui/styles/withStyles';
import { addTag } from '../../../../actions/Tag';
import TagForm from './TagForm';
import inject18n from '../../../../components/i18n';
import Transition from '../../../../components/common/Transition';

const styles = () => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 230,
  },
});

class CreateTag extends Component {
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
    this.props
      .addTag(data)
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
          <DialogTitle>{t('Create a new tag')}</DialogTitle>
          <DialogContent>
            <TagForm
              onSubmit={this.onSubmit.bind(this)}
              handleClose={this.handleClose.bind(this)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

CreateTag.propTypes = {
  t: PropTypes.func,
  classes: PropTypes.object,
  addTag: PropTypes.func,
};

export default R.compose(
  connect(null, { addTag }),
  inject18n,
  withStyles(styles),
)(CreateTag);
