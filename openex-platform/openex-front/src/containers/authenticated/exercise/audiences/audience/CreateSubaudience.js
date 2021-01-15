import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Slide from '@material-ui/core/Slide';
import { withStyles } from '@material-ui/core/styles';
import { Add } from '@material-ui/icons';
import Toolbar from '@material-ui/core/Toolbar';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import SubaudienceForm from './SubaudienceForm';
import {
  addSubaudience,
  selectSubaudience,
} from '../../../../../actions/Subaudience';
import { submitForm } from '../../../../../utils/Action';

i18nRegister({
  fr: {
    'Sub-audiences': 'Sous-audiences',
    'Create a new sub-audience': 'Créer une nouvelle sous-audience',
  },
});

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
  container: {
    padding: 15,
  },
});

class CreateSubaudience extends Component {
  constructor(props) {
    super(props);
    this.state = { openCreate: false };
  }

  handleOpenCreate() {
    this.setState({ openCreate: true });
  }

  handleCloseCreate() {
    this.setState({ openCreate: false });
  }

  onSubmitCreate(data) {
    return this.props
      .addSubaudience(this.props.exerciseId, this.props.audienceId, data)
      .then((payload) => {
        this.props.selectSubaudience(
          this.props.exerciseId,
          this.props.audienceId,
          payload.result,
        );
      });
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Toolbar />
        <div className={classes.container}>
        <Typography variant="h5">
          <T>Sub-audiences</T>
        </Typography>
        {this.props.can_create && (
          <IconButton
            className={classes.createButton}
            onClick={this.handleOpenCreate.bind(this)}
          >
            <Add />
          </IconButton>
        )}
        <Dialog
          open={this.state.openCreate}
          TransitionComponent={Transition}
          onClose={this.handleCloseCreate.bind(this)}
        >
          <DialogTitle>
            <T>Create a new sub-audience</T>
          </DialogTitle>
          <DialogContent>
            <SubaudienceForm onSubmit={this.onSubmitCreate.bind(this)} />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseCreate.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => submitForm('subaudienceForm')}
            >
              <T>Create</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      </div>
    );
  }
}

CreateSubaudience.propTypes = {
  exerciseId: PropTypes.string,
  audienceId: PropTypes.string,
  addSubaudience: PropTypes.func,
  selectSubaudience: PropTypes.func,
  can_create: PropTypes.bool,
};

export default R.compose(
  connect(null, {
    addSubaudience,
    selectSubaudience,
  }),
  withStyles(styles),
)(CreateSubaudience);
