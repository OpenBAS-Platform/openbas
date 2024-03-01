import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Fab, Dialog, DialogTitle, DialogContent, Slide } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { Add } from '@mui/icons-material';
import { addUser } from '../../../../actions/User';
import UserForm from './UserForm';
import inject18n from '../../../../components/i18n';

const styles = () => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 230,
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class CreateUser extends Component {
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
      R.assoc(
        'user_organization',
        data.user_organization && data.user_organization.id
          ? data.user_organization.id
          : data.user_organization,
      ),
      R.assoc('user_tags', R.pluck('id', data.user_tags)),
    )(data);
    return this.props
      .addUser(inputValues)
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
          <DialogTitle>{t('Create a new user')}</DialogTitle>
          <DialogContent>
            <UserForm
              editing={false}
              onSubmit={this.onSubmit.bind(this)}
              initialValues={{ user_tags: [] }}
              handleClose={this.handleClose.bind(this)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

CreateUser.propTypes = {
  t: PropTypes.func,
  organizations: PropTypes.array,
  addUser: PropTypes.func,
};

export default R.compose(
  connect(null, { addUser }),
  inject18n,
  withStyles(styles),
)(CreateUser);
