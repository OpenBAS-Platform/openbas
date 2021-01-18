import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { GroupOutlined } from '@material-ui/icons';
import { green, red } from '@material-ui/core/colors';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import { selectSubaudience } from '../../../../../actions/Subaudience';
import SubaudiencePopover from './SubaudiencePopover';
import CreateSubaudience from './CreateSubaudience';
import { T } from '../../../../../components/I18n';

const styles = () => ({
  drawerPaper: {
    width: 300,
  },
  itemActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  enabled: {
    color: green[500],
  },
  disabled: {
    color: red[500],
  },
});

class SubaudienceNav extends Component {
  handleChangeAudience(subaudienceId) {
    this.props.selectSubaudience(
      this.props.exerciseId,
      this.props.audienceId,
      subaudienceId,
    );
  }

  render() {
    const {
      classes,
      audience,
      audienceId,
      exerciseId,
      subaudiences,
    } = this.props;
    const subaudienceIsUpdatable = R.propOr(
      true,
      'user_can_update',
      this.props.audience,
    );
    return (
      <Drawer
        variant="permanent"
        classes={{ paper: classes.drawerPaper }}
        anchor="right"
      >
        <Toolbar />
        {subaudienceIsUpdatable ? (
          <CreateSubaudience exerciseId={exerciseId} audienceId={audienceId} />
        ) : (
          <div style={{ margin: '15px 0 0 15px' }}>
            <Typography variant="h5">
              <T>Sub-audiences</T>
            </Typography>
          </div>
        )}
        <List>
          {this.props.subaudiences.map((subaudience) => (
            <ListItem
              key={subaudience.subaudience_id}
              className={
                this.props.selectedSubaudience === subaudience.subaudience_id
                  ? classes.itemActive
                  : classes.item
              }
              button={true}
              divider={true}
              onClick={this.handleChangeAudience.bind(
                this,
                subaudience.subaudience_id,
              )}
            >
              <ListItemIcon
                className={
                  subaudience.subaudience_enabled
                    ? classes.enabled
                    : classes.disabled
                }
              >
                <GroupOutlined />
              </ListItemIcon>
              <ListItemText primary={subaudience.subaudience_name} />
              <ListItemSecondaryAction>
                <SubaudiencePopover
                  exerciseId={exerciseId}
                  audienceId={audienceId}
                  audience={audience}
                  subaudience={subaudience}
                  subaudiences={subaudiences}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Drawer>
    );
  }
}

SubaudienceNav.propTypes = {
  exerciseId: PropTypes.string,
  audienceId: PropTypes.string,
  audience: PropTypes.object,
  selectedSubaudience: PropTypes.string,
  subaudiences: PropTypes.array,
  selectSubaudience: PropTypes.func,
};

export default R.compose(
  connect(null, {
    selectSubaudience,
  }),
  withStyles(styles),
)(SubaudienceNav);
