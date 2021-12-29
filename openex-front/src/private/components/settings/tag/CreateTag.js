import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Add } from '@mui/icons-material';
import withStyles from '@mui/styles/withStyles';
import Slide from '@mui/material/Slide';
import Fab from '@mui/material/Fab';
import { addTag } from '../../../../actions/Tag';
import TagForm from './TagForm';
import inject18n from '../../../../components/i18n';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = () => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
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
        >
          <DialogTitle>{t('Create a new tag')}</DialogTitle>
          <DialogContent>
            <TagForm onSubmit={this.onSubmit.bind(this)} />
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleClose.bind(this)}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              form="tagForm"
            >
              {t('Create')}
            </Button>
          </DialogActions>
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
