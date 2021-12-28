import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Slide from '@mui/material/Slide';
import withStyles from '@mui/styles/withStyles';
import { Add } from '@mui/icons-material';
import { i18nRegister } from '../../../../utils/Messages';
import { addUser } from '../../../../actions/User';
import UserForm from './UserForm';
import { T } from '../../../../components/I18n';
import { submitForm } from '../../../../utils/Action';

i18nRegister({
  fr: {
    'Create user': "Créer l'utilisateur",
    'Create a user': 'Créer un utilisateur',
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

class CreateUser extends Component {
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
      .addUser(data)
      .then((result) => (result.result ? this.handleCloseCreate() : result));
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
          open={this.state.openCreate}
          TransitionComponent={Transition}
          onClose={this.handleCloseCreate.bind(this)}
        >
          <DialogTitle>
            <T>Create a user</T>
          </DialogTitle>
          <DialogContent>
            <UserForm
              editing={false}
              onSubmit={this.onSubmitCreate.bind(this)}
              organizations={this.props.organizations}
            />
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
              onClick={() => submitForm('userForm')}
            >
              <T>Create</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

CreateUser.propTypes = {
  organizations: PropTypes.object,
  addUser: PropTypes.func,
};

const select = (state) => ({
  organizations: state.referential.entities.organizations,
});

export default R.compose(
  connect(select, { addUser }),
  withStyles(styles),
)(CreateUser);
