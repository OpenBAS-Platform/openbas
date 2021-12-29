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
import { addGroup } from '../../../../actions/Group';
import GroupForm from './GroupForm';
import inject18n from '../../../../components/i18n';

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
    return this.props
      .addGroup(data)
      .then((result) => (result.result ? this.handleCloseCreate() : result));
  }

  render() {
    const { classes, t } = this.props;
    return (
      <div>
        <Fab
          onClick={this.handleOpenCreate.bind(this)}
          color="primary"
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
          <DialogTitle>{t('Create a group')}</DialogTitle>
          <DialogContent>
            <GroupForm
              editing={false}
              onSubmit={this.onSubmitCreate.bind(this)}
              organizations={this.props.organizations}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleCloseCreate.bind(this)}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              form="groupForm"
            >
              {t('Create')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

CreateGroup.propTypes = {
  t: PropTypes.func,
  organizations: PropTypes.object,
  addGroup: PropTypes.func,
};

const select = (state) => ({
  organizations: state.referential.entities.organizations,
});

export default R.compose(
  connect(select, { addGroup }),
  inject18n,
  withStyles(styles),
)(CreateGroup);
