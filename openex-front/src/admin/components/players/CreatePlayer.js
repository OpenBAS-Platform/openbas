import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Fab from '@mui/material/Fab';
import withStyles from '@mui/styles/withStyles';
import { Add, ControlPointOutlined } from '@mui/icons-material';
import { ListItemIcon } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import { addPlayer } from '../../../actions/User';
import PlayerForm from './PlayerForm';
import Drawer from "../../../components/common/Drawer";
import inject18n from '../../../components/i18n';
import Dialog from "../../../components/common/Dialog";

const styles = (theme) => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
});

class CreatePlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      openDrawer: false,
    };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleOpenDrawer() {
    this.setState({ openDrawer: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  handleCloseDrawer() {
    this.setState({ openDrawer: false });
  }

  onSubmit(data) {
    const inputValues = R.pipe(
      R.assoc(
        'user_organization',
        data.user_organization && data.user_organization.id
          ? data.user_organization.id
          : data.user_organization,
      ),
      R.assoc(
        'user_country',
        data.user_country && data.user_country.id
          ? data.user_country.id
          : data.user_country,
      ),
      R.assoc('user_tags', R.pluck('id', data.user_tags)),
    )(data);
    return this.props.addPlayer(inputValues).then((result) => {
      if (result.result) {
        if (this.props.onCreate) {
          this.props.onCreate(result.result);
        }
        if (this.state.open) {
          return this.handleClose();
        }
        if (this.state.openDrawer) {
          return this.handleCloseDrawer();
        }
      }
      return result;
    });
  }

  render() {
    const { classes, t, organizations, inline } = this.props;
    return (
      <div>
        {inline === true ? (
          <ListItem
            button={true}
            divider={true}
            onClick={this.handleOpen.bind(this)}
            color="primary"
          >
            <ListItemIcon color="primary">
              <ControlPointOutlined color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={t('Create a new player')}
              classes={{ primary: classes.text }}
            />
          </ListItem>
        ) : (
          <Fab
            onClick={this.handleOpenDrawer.bind(this)}
            color="primary"
            aria-label="Add"
            className={classes.createButton}
          >
            <Add />
          </Fab>
        )}
        <Dialog
          open={this.state.open}
          handleClose={this.handleClose.bind(this)}
          title={t('Create a new player')}>
          <PlayerForm
            editing={false}
            onSubmit={this.onSubmit.bind(this)}
            organizations={organizations}
            initialValues={{ user_tags: [] }}
            handleClose={this.handleClose.bind(this)}
          />
        </Dialog>
        <Drawer
          open={this.state.openDrawer}
          handleClose={this.handleCloseDrawer.bind(this)}
          title={t('Create a new player')}>
          <PlayerForm
            editing={false}
            onSubmit={this.onSubmit.bind(this)}
            organizations={organizations}
            initialValues={{ user_tags: [] }}
            handleClose={this.handleCloseDrawer.bind(this)}
            variant="contained"
          />
        </Drawer>
      </div>
    );
  }
}

CreatePlayer.propTypes = {
  t: PropTypes.func,
  addPlayer: PropTypes.func,
  inline: PropTypes.bool,
  onCreate: PropTypes.func,
  organizations: PropTypes.array,
};

export default R.compose(
  connect(null, { addPlayer }),
  inject18n,
  withStyles(styles),
)(CreatePlayer);
