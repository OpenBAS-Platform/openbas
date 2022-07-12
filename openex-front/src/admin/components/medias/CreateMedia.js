import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import withStyles from '@mui/styles/withStyles';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Add } from '@mui/icons-material';
import Slide from '@mui/material/Slide';
import inject18n from '../../../components/i18n';
import { addMedia } from '../../../actions/Media';
import MediaForm from './MediaForm';

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

class CreateMedia extends Component {
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
      .addMedia(data)
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
          className={classes.createButton}>
          <Add />
        </Fab>
        <Dialog
          open={this.state.open}
          TransitionComponent={Transition}
          onClose={this.handleClose.bind(this)}
          fullWidth={true}
          maxWidth="md"
          PaperProps={{ elevation: 1 }}>
          <DialogTitle>{t('Create a new media')}</DialogTitle>
          <DialogContent>
            <MediaForm onSubmit={this.onSubmit.bind(this)}
                initialValues={{}}
                handleClose={this.handleClose.bind(this)}/>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

CreateMedia.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  addMedia: PropTypes.func,
};

export default R.compose(
  connect(null, { addMedia }),
  inject18n,
  withStyles(styles),
)(CreateMedia);
