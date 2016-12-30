import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {i18nRegister} from '../../../../utils/Messages'
import * as Constants from '../../../../constants/ComponentTypes'
import {Popover} from '../../../../components/Popover';
import {Menu} from '../../../../components/Menu'
import {Dialog} from '../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../components/Button'
import {Icon} from '../../../../components/Icon'
import {MenuItemLink} from "../../../../components/menu/MenuItem"
import {addDryrun} from '../../../../actions/Dryrun'
import {redirectToDryrun} from '../../../../actions/Application'
import DryrunForm from './DryrunForm'

const style = {
  float: 'left',
  marginTop: '-14px'
}

i18nRegister({
  fr: {
    'Launch a dryrun': 'Lancer un dryrun'
  }
})

class DryrunsPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openLaunch: false,
      openPopover: false
    }
  }

  handlePopoverOpen(event) {
    event.preventDefault()
    this.setState({
      openPopover: true,
      anchorEl: event.currentTarget,
    })
  }

  handlePopoverClose() {
    this.setState({openPopover: false})
  }

  handleOpenLaunch() {
    this.setState({openLaunch: true})
    this.handlePopoverClose()
  }

  handleCloseLaunch() {
    this.setState({openLaunch: false})
  }

  onSubmitLaunch(data) {
    return this.props.addDryrun(this.props.exerciseId, data).then((payload) => {
      this.props.redirectToDryrun(this.props.exerciseId, payload.result)
    })
  }

  submitFormLaunch() {
    this.refs.dryrunForm.submit()
  }

  render() {
    const launchActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseLaunch.bind(this)}/>,
      <FlatButton label="Launch" primary={true} onTouchTap={this.submitFormLaunch.bind(this)}/>,
    ]

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
        </IconButton>
        <Popover open={this.state.openPopover} anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            <MenuItemLink label="Launch a dryrun" onTouchTap={this.handleOpenLaunch.bind(this)}/>
          </Menu>
        </Popover>
        <Dialog
          title="Launch a dryrun"
          modal={false}
          open={this.state.openLaunch}
          onRequestClose={this.handleCloseLaunch.bind(this)}
          actions={launchActions}
        >
          <DryrunForm ref="dryrunForm" audiences={this.props.audiences} onSubmit={this.onSubmitLaunch.bind(this)} onSubmitSuccess={this.handleCloseLaunch.bind(this)}/>
        </Dialog>
      </div>
    )
  }
}

DryrunsPopover.propTypes = {
  exerciseId: PropTypes.string,
  audiences: PropTypes.array,
  addDryrun: PropTypes.func,
  redirectToDryrun: PropTypes.func
}

export default connect(null, {addDryrun, redirectToDryrun})(DryrunsPopover)
