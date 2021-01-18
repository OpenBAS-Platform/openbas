import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Fab from '@material-ui/core/Fab';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { Add } from '@material-ui/icons';
import Slide from '@material-ui/core/Slide';
import { addGroup } from '../../../../actions/Group';
import GroupForm from './GroupForm';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import { submitForm } from '../../../../utils/Action';

i18nRegister({
  fr: {
    'Create a group': 'Créer un groupe',
  },
});

const styles = () => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class CreateGroup extends Component {
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
    return this.props.addGroup(data).then(() => this.handleCloseCreate());
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Fab
          onClick={this.handleOpenCreate.bind(this)}
          color="secondary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
        </Fab>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openCreate}
          onClose={this.handleCloseCreate.bind(this)}
        >
          <DialogTitle>
            <T>Create a group</T>
          </DialogTitle>
          <DialogContent>
            <GroupForm onSubmit={this.onSubmitCreate.bind(this)} />
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
              onClick={() => submitForm('groupForm')}
            >
              <T>Create</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

CreateGroup.propTypes = {
  addGroup: PropTypes.func,
};

export default R.compose(
  connect(null, { addGroup }),
  withStyles(styles),
)(CreateGroup);
