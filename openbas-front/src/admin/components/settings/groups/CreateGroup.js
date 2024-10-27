import { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Fab } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Add } from '@mui/icons-material';
import { addGroup } from '../../../../actions/Group';
import GroupForm from './GroupForm';
import inject18n from '../../../../components/i18n';
import Drawer from '../../../../components/common/Drawer';

const styles = () => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 230,
  },
});

class CreateGroup extends Component {
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
      .addGroup(data)
      .then((result) => {
        if (this.props.onCreate) {
          const groupCreated = result.entities.groups[result.result];
          this.props.onCreate(groupCreated);
        }
        return result.result ? this.handleClose() : result;
      });
  }

  render() {
    const { classes, t } = this.props;
    return (
      <>
        <Fab
          onClick={this.handleOpen.bind(this)}
          color="primary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
        </Fab>
        <Drawer
          open={this.state.open}
          handleClose={this.handleClose.bind(this)}
          title={t('Create a new group')}
        >
          <GroupForm
            editing={false}
            onSubmit={this.onSubmit.bind(this)}
            handleClose={this.handleClose.bind(this)}
          />
        </Drawer>
      </>
    );
  }
}

CreateGroup.propTypes = {
  t: PropTypes.func,
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
