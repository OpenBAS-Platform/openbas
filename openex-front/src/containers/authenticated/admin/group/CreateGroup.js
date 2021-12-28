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
import withStyles from '@mui/styles/withStyles';
import { Add } from '@mui/icons-material';
import Slide from '@mui/material/Slide';
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
