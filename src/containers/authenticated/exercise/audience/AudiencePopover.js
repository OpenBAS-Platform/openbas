import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import * as Constants from '../../../../constants/ComponentTypes'
import R from 'ramda'
import {Popover} from '../../../../components/Popover'
import {Menu} from '../../../../components/Menu'
import {Dialog} from '../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../components/Button'
import {Icon} from '../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../components/menu/MenuItem"
import {addComcheck} from '../../../../actions/Comcheck'
import {updateAudience, selectAudience, deleteAudience} from '../../../../actions/Audience'
import AudienceForm from './AudienceForm'
import ComcheckForm from '../check/ComcheckForm'

const style = {
  float: 'left',
  marginTop: '-13px'
}

class AudiencePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openComcheck: false,
      openPopover: false
    }
  }

  handlePopoverOpen(event) {
    event.preventDefault()
    this.setState({openPopover: true, anchorEl: event.currentTarget})
  }

  handlePopoverClose() {
    this.setState({openPopover: false})
  }

  handleOpenComcheck() {
    this.setState({openComcheck: true})
    this.handlePopoverClose()
  }

  handleCloseComcheck() {
    this.setState({openComcheck: false})
  }

  onSubmitComcheck(data) {
    data.comcheck_audience = this.props.audience.audience_id
    return this.props.addComcheck(this.props.exerciseId, data)
  }

  submitFormComcheck() {
    this.refs.comcheckForm.submit()
  }

  handleOpenEdit() {
    this.setState({openEdit: true})
    this.handlePopoverClose()
  }

  handleCloseEdit() {
    this.setState({openEdit: false})
  }

  onSubmitEdit(data) {
    return this.props.updateAudience(this.props.exerciseId, this.props.audience.audience_id, data)
  }

  submitFormEdit() {
    this.refs.audienceForm.submit()
  }

  handleOpenDelete() {
    this.setState({openDelete: true})
    this.handlePopoverClose()
  }

  handleCloseDelete() {
    this.setState({openDelete: false})
  }

  submitDelete() {
    this.props.deleteAudience(this.props.exerciseId, this.props.audience.audience_id).then(() => {
      this.props.selectAudience(this.props.exerciseId, undefined)
    })
    this.handleCloseDelete()
  }

  render() {
    const initialComcheckValues = {
      comcheck_subject: 'Communication check',
      comcheck_message: 'Hello,<br /><br />This is a communication ' +
      'check before the beginning of the exercise. Please click on the following ' +
      'link in order to confirm you successfully received this message:',
      comcheck_footer: 'Best regards,<br />The exercise control Team'
    }

    const comcheckActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseComcheck.bind(this)}/>,
      <FlatButton label="Launch" primary={true} onTouchTap={this.submitFormComcheck.bind(this)}/>,
    ]
    const editActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseEdit.bind(this)}/>,
      <FlatButton label="Update" primary={true} onTouchTap={this.submitFormEdit.bind(this)}/>,
    ]
    const deleteActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseDelete.bind(this)}/>,
      <FlatButton label="Delete" primary={true} onTouchTap={this.submitDelete.bind(this)}/>,
    ]

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
        </IconButton>
        <Popover open={this.state.openPopover} anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            <MenuItemLink label="Launch a comcheck" onTouchTap={this.handleOpenComcheck.bind(this)}/>
            <MenuItemLink label="Edit" onTouchTap={this.handleOpenEdit.bind(this)}/>
            <MenuItemButton label="Delete" onTouchTap={this.handleOpenDelete.bind(this)}/>
          </Menu>
        </Popover>
        <Dialog title="Confirmation" modal={false}
                open={this.state.openDelete}
                onRequestClose={this.handleCloseDelete.bind(this)}
                actions={deleteActions}>
          Do you confirm the deletion of this audience?
        </Dialog>
        <Dialog title="Update the audience" modal={false}
                open={this.state.openEdit}
                onRequestClose={this.handleCloseEdit.bind(this)}
                actions={editActions}>
          <AudienceForm ref="audienceForm" initialValues={R.pick(['audience_name'], this.props.audience)}
                        onSubmit={this.onSubmitEdit.bind(this)} onSubmitSuccess={this.handleCloseEdit.bind(this)}/>
        </Dialog>
        <Dialog title="Launch a comcheck" modal={false}
                open={this.state.openComcheck}
                onRequestClose={this.handleCloseComcheck.bind(this)}
                actions={comcheckActions}>
          <ComcheckForm ref="comcheckForm"
                        initialValues={initialComcheckValues}
                        onSubmit={this.onSubmitComcheck.bind(this)}
                        onSubmitSuccess={this.handleCloseComcheck.bind(this)}/>
        </Dialog>
      </div>
    )
  }
}

AudiencePopover.propTypes = {
  exerciseId: PropTypes.string,
  deleteAudience: PropTypes.func,
  updateAudience: PropTypes.func,
  selectAudience: PropTypes.func,
  addComcheck: PropTypes.func,
  audience: PropTypes.object,
  children: PropTypes.node
}

export default connect(null, {updateAudience, selectAudience, deleteAudience, addComcheck})(AudiencePopover)