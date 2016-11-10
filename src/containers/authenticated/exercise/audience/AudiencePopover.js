import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {Map} from 'immutable'
import * as Constants from '../../../../constants/ComponentTypes'
import {Popover} from '../../../../components/Popover';
import {Menu} from '../../../../components/Menu'
import {Dialog} from '../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../components/Button'
import {Icon} from '../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../components/menu/MenuItem"
import {updateAudience, deleteAudience} from '../../../../actions/Audience'
import AudienceForm from './AudienceForm'

const style = {
  float: 'left',
  marginTop: '-14px'
}

class AudiencePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
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

  handleOpenEdit() {
    this.setState({
      openEdit: true
    })
    this.handlePopoverClose()
  }

  handleCloseEdit() {
    this.setState({
      openEdit: false
    })
  }

  onSubmitEdit(data) {
    this.props.updateAudience(this.props.exerciseId, this.props.audienceId, data)
    this.handleCloseEdit()
  }

  submitFormEdit() {
    this.refs.audienceForm.submit()
  }

  handleOpenDelete() {
    this.setState({
      openDelete: true
    })
    this.handlePopoverClose()
  }

  handleCloseDelete() {
    this.setState({
      openDelete: false
    })
  }

  submitDelete() {
    this.props.deleteAudience(this.props.exerciseId, this.props.audienceId)
    this.handleCloseDelete()
  }

  render() {
    const editActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseEdit.bind(this)}
      />,
      <FlatButton
        label="Update"
        primary={true}
        onTouchTap={this.submitFormEdit.bind(this)}
      />,
    ];
    const deleteActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseDelete.bind(this)}
      />,
      <FlatButton
        label="Delete"
        primary={true}
        onTouchTap={this.submitDelete.bind(this)}
      />,
    ];

    let initialInformation = undefined
    if (this.props.audience) {
      initialInformation = {
        audience_name: this.props.audience.get('audience_name'),
      }
    }
    console.log('INITIAL', initialInformation)
    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
        </IconButton>
        <Popover open={this.state.openPopover}
                 anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            <MenuItemLink label="Edit" onTouchTap={this.handleOpenEdit.bind(this)}/>
            <MenuItemButton label="Delete" onTouchTap={this.handleOpenDelete.bind(this)}/>
          </Menu>
        </Popover>
        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openDelete}
          onRequestClose={this.handleCloseDelete.bind(this)}
          actions={deleteActions}
        >
          Do you confirm the deletion of this audience?
        </Dialog>
        <Dialog
          title="Update the audience"
          modal={false}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit.bind(this)}
          actions={editActions}
        >
          <AudienceForm ref="audienceForm" initialValues={initialInformation} onSubmit={this.onSubmitEdit.bind(this)}/>
        </Dialog>
      </div>
    )
  }
}

const select = (state, props) => {
  let audiences = state.application.getIn(['entities', 'audiences'])
  let currentAudience = state.application.getIn(['ui', 'states', 'current_audiences', props.exerciseId])
  let audience = currentAudience ? audiences.get(currentAudience) : Map()

  return {
    audience
  }
}

AudiencePopover.propTypes = {
  exerciseId: PropTypes.string,
  audienceId: PropTypes.string,
  deleteAudience: PropTypes.func,
  updateAudience: PropTypes.func,
  audience: PropTypes.object,
  children: PropTypes.node
}

export default connect(select, {updateAudience, deleteAudience})(AudiencePopover)