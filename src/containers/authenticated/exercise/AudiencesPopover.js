import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {i18nRegister} from '../../../utils/Messages'
import * as Constants from '../../../constants/ComponentTypes'
import {Popover} from '../../../components/Popover';
import {Menu} from '../../../components/Menu'
import {IconButton} from '../../../components/Button'
import {Icon} from '../../../components/Icon'
import {MenuItemLink} from "../../../components/menu/MenuItem"
import {downloadExportAudiences} from '../../../actions/Audience'

const style = {
  float: 'left',
  marginTop: '-14px'
}

i18nRegister({
  fr: {
    'Export audiences to XLS': 'Export des audiences en XLS'
  }
})

class AudiencesPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {openPopover: false}
  }

  handlePopoverOpen(event) {
    event.stopPropagation()
    this.setState({openPopover: true, anchorEl: event.currentTarget})
  }

  handlePopoverClose() {
    this.setState({openPopover: false})
  }

  handleDownloadAudiences() {
    this.props.downloadExportAudiences(this.props.exerciseId)
  }

  render() {
    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
        </IconButton>
        <Popover open={this.state.openPopover} anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            <MenuItemLink label="Export audiences to XLS" onTouchTap={this.handleDownloadAudiences.bind(this)}/>
          </Menu>
        </Popover>
      </div>
    )
  }
}

AudiencesPopover.propTypes = {
  exerciseId: PropTypes.string,
  downloadExportAudiences: PropTypes.func
}

export default connect(null, {downloadExportAudiences})(AudiencesPopover)
