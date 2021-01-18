import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import { i18nRegister } from '../../../utils/Messages';
import * as Constants from '../../../constants/ComponentTypes';
import { Popover } from '../../../components/Popover';
import { Menu } from '../../../components/Menu';
import { Icon } from '../../../components/Icon';
import { MenuItemLink } from '../../../components/menu/MenuItem';
import { downloadExportAudiences } from '../../../actions/Audience';

const style = {
  float: 'left',
  marginTop: '-14px',
};

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
    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT} />
        </IconButton>
        <Popover
          open={this.state.openPopover}
          anchorEl={this.state.anchorEl}
          onClose={this.handlePopoverClose.bind(this)}
        >
          <Menu multiple={false}>
            <MenuItemLink
              label="Export audiences to XLS"
              onClick={this.handleDownloadAudiences.bind(this)}
            />
          </Menu>
        </Popover>
      </div>
    );
  }
}

AudiencesPopover.propTypes = {
  exerciseId: PropTypes.string,
  downloadExportAudiences: PropTypes.func,
};

export default connect(null, { downloadExportAudiences })(AudiencesPopover);
