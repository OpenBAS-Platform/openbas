import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import IconButton from '@mui/material/IconButton';
import withStyles from '@mui/styles/withStyles';
import { MoreVert } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { downloadExportAudiences } from '../../../actions/Audience';
import { i18nRegister } from '../../../utils/Messages';
import { T } from '../../../components/I18n';

const styles = () => ({
  container: {
    float: 'left',
    marginTop: -8,
  },
});

i18nRegister({
  fr: {
    'Export audiences to XLS': 'Export des audiences en XLS',
  },
});

class AudiencesPopover extends Component {
  constructor(props) {
    super(props);
    this.state = { openPopover: false };
  }

  handlePopoverOpen(event) {
    event.stopPropagation();
    this.setState({ anchorEl: event.currentTarget });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: null });
  }

  handleDownloadAudiences() {
    this.props.downloadExportAudiences(this.props.exerciseId);
    this.handlePopoverClose();
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          aria-haspopup="true"
          size="large">
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handlePopoverClose.bind(this)}
          style={{ marginTop: 50 }}
        >
          <MenuItem onClick={this.handleDownloadAudiences.bind(this)}>
            <T>Export audiences to XLS</T>
          </MenuItem>
        </Menu>
      </div>
    );
  }
}

AudiencesPopover.propTypes = {
  exerciseId: PropTypes.string,
  downloadExportAudiences: PropTypes.func,
};

export default R.compose(
  connect(null, { downloadExportAudiences }),
  withStyles(styles),
)(AudiencesPopover);
