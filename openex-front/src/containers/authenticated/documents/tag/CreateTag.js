import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Add } from '@mui/icons-material';
import withStyles from '@mui/styles/withStyles';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import { addTag } from '../../../../actions/Tag';
import TagForm from './TagForm';
import { submitForm } from '../../../../utils/Action';

i18nRegister({
  fr: {
    'Create a new tag': 'Créer un nouveau tag',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = () => ({
  createButton: {
    float: 'left',
    marginTop: -8,
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
    const { classes } = this.props;
    return (
      <div style={{ margin: '15px 0 0 15px' }}>
        <Typography variant="h5" style={{ float: 'left' }}>
          <T>Tags</T>
        </Typography>
        <IconButton
          onClick={this.handleOpen.bind(this)}
          aria-label="Add"
          className={classes.createButton}
          size="large"
        >
          <Add color="secondary" />
        </IconButton>
        <Dialog
          open={this.state.open}
          TransitionComponent={Transition}
          onClose={this.handleClose.bind(this)}
        >
          <DialogTitle>
            <T>Create a new tag</T>
          </DialogTitle>
          <DialogContent>
            <TagForm onSubmit={this.onSubmit.bind(this)} />
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={this.handleClose.bind(this)}>
              <T>Cancel</T>
            </Button>
            <Button
              color="secondary"
              variant="outlined"
              onClick={() => submitForm('tagForm')}
            >
              <T>Create</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

CreateTag.propTypes = {
  addTag: PropTypes.func,
};

export default R.compose(
  connect(null, { addTag }),
  withStyles(styles),
)(CreateTag);
