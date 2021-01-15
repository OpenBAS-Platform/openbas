import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import { Add } from '@material-ui/icons';
import Fab from '@material-ui/core/Fab';
import { withStyles } from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide';
import { T } from '../../../../../components/I18n';
import { i18nRegister } from '../../../../../utils/Messages';
import { addTag } from '../../../../../actions/Tag';
import TagForm from './TagForm';
import { submitForm } from '../../../../../utils/Action';

i18nRegister({
  fr: {
    'Create a new tag': 'Créer un nouveau TAG',
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
    this.props.addTag(data).then(() => this.handleClose());
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <IconButton
          onClick={this.handleOpen.bind(this)}
          color="secondary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
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
