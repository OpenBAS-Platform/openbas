import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { connect } from 'react-redux';
import { CloseRounded, PersonOutlined } from '@mui/icons-material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import inject18n from '../../../../components/i18n';
import { fetchInjectAudiences } from '../../../../actions/Inject';
import ItemTags from '../../../../components/ItemTags';
import { storeBrowser } from '../../../../actions/Schema';
import AudiencePopover from '../audiences/AudiencePopover';

const styles = (theme) => ({
  header: {
    backgroundColor: theme.palette.background.paper,
    padding: '20px 20px 20px 60px',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    left: 5,
    color: 'inherit',
  },
  title: {
    float: 'left',
  },
  container: {
    padding: 20,
  },
});

class InjectDefinition extends Component {
  componentDidMount() {
    const { exerciseId, injectId } = this.props;
    this.props.fetchInjectAudiences(exerciseId, injectId);
  }

  render() {
    const {
      t, classes, handleClose, inject, exerciseId,
    } = this.props;
    const sort = R.sortWith([R.ascend(R.prop('audience_name'))]);
    const sortedAudiences = sort(inject.getAudiences());
    return (
      <div>
        <div className={classes.header}>
          <IconButton
            aria-label="Close"
            className={classes.closeButton}
            onClick={handleClose.bind(this)}
          >
            <CloseRounded />
          </IconButton>
          <Typography variant="h6" classes={{ root: classes.title }}>
            {R.propOr('-', 'inject_title', inject)}
          </Typography>
          <div className="clearfix" />
        </div>
        <div className={classes.container}>
          <Typography variant="h2">{t('Targeted audiences')}</Typography>
          <List>
            {sortedAudiences.map((audience) => (
              <ListItem key={audience.audience_id} divider={true}>
                <ListItemIcon>
                  <PersonOutlined />
                </ListItemIcon>
                <ListItemText
                  primary={audience.audience_name}
                  secondary={audience.audience_description}
                />
                <ItemTags tags={audience.getTags()} />
                <ListItemSecondaryAction>
                  <AudiencePopover
                    exerciseId={exerciseId}
                    audience={audience}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </div>
      </div>
    );
  }
}

InjectDefinition.propTypes = {
  t: PropTypes.func,
  nsdt: PropTypes.func,
  exerciseId: PropTypes.string,
  injectId: PropTypes.string,
  inject: PropTypes.object,
  fetchInjectAudiences: PropTypes.func,
  handleClose: PropTypes.func,
};

const select = (state, ownProps) => {
  const browser = storeBrowser(state);
  const { injectId } = ownProps;
  return {
    inject: browser.getInject(injectId),
  };
};

export default R.compose(
  connect(select, { fetchInjectAudiences }),
  inject18n,
  withStyles(styles),
)(InjectDefinition);
