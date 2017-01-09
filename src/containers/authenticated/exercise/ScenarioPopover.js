import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {i18nRegister} from '../../../utils/Messages'
import * as Constants from '../../../constants/ComponentTypes'
import {Popover} from '../../../components/Popover';
import {Menu} from '../../../components/Menu'
import {IconButton} from '../../../components/Button'
import {Icon} from '../../../components/Icon'
import {MenuItemLink} from "../../../components/menu/MenuItem"
import {downloadExportInjects} from '../../../actions/Inject'

const style = {
  float: 'left',
  marginTop: '-14px'
}

i18nRegister({
  fr: {
    'Export injects to XLS': 'Export des injects en XLS'
  }
})

class ScenarioPopover extends Component {
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

  handleDownloadInjects() {
    this.props.downloadExportInjects(this.props.exerciseId)
    this.handlePopoverClose()
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
            <MenuItemLink label="Export injects to XLS" onTouchTap={this.handleDownloadInjects.bind(this)}/>
          </Menu>
        </Popover>
      </div>
    )
  }
}

ScenarioPopover.propTypes = {
  exerciseId: PropTypes.string,
  downloadExportInjects: PropTypes.func
}

export default connect(null, {downloadExportInjects})(ScenarioPopover)
