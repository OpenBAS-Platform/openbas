import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {Map} from 'immutable'
import moment from 'moment';
import * as Constants from '../../../../../constants/ComponentTypes'
import {Popover} from '../../../../../components/Popover';
import {Menu} from '../../../../../components/Menu'
import {Dialog} from '../../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../../components/Button'
import {Icon} from '../../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../../components/menu/MenuItem"
import {updateInject, deleteInject} from '../../../../../actions/Inject'
import InjectForm from './InjectForm'

const style = {
  float: 'left',
  marginTop: '-14px'
}

const types = Map({
  0: Map({
    type_id: "0",
    type_name: "EMAIL"
  }),
  1: Map({
    type_id: "1",
    type_name: "SMS"
  })
})

class InjectPopover extends Component {
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
    return this.props.updateInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.props.injectId, data)
  }

  submitFormEdit() {
    this.refs.userForm.submit()
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
    this.props.deleteInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.props.injectId)
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
    if (this.props.inject) {
      initialInformation = {
        inject_title: this.props.inject.get('inject_title'),
        inject_description: this.props.inject.get('inject_description'),
        inject_content: this.props.inject.get('inject_content'),
        inject_date: moment(this.props.inject.get('inject_date')).format('YYYY-MM-DD HH:mm:ss'),
        inject_sender: this.props.inject.get('inject_sender'),
        inject_type: this.props.inject.get('inject_type')
      }
    }

    console.log('initialInformation', initialInformation)

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
          Do you confirm the removing of this inject?
        </Dialog>
        <Dialog
          title="Update the inject"
          modal={false}
          autoScrollBodyContent={true}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit.bind(this)}
          actions={editActions}
        >
          <InjectForm
            ref="injectForm"
            initialValues={initialInformation}
            onSubmit={this.onSubmitEdit.bind(this)}
            onSubmitSuccess={this.handleCloseEdit.bind(this)}
            types={types.toList().map(type => {
              return (
                <MenuItemLink key={type.get('type_id')} value={type.get('type_name')}
                              label={type.get('type_name')}/>
              )
            })}/>
        </Dialog>
      </div>
    )
  }
}

const select = (state, props) => {
  return {
    inject: state.application.getIn(['entities', 'injects', props.injectId]),
  }
}

InjectPopover.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  incidentId: PropTypes.string,
  injectId: PropTypes.string,
  updateInject: PropTypes.func,
  deleteInject: PropTypes.func,
  inject: PropTypes.object,
  children: PropTypes.node
}

export default connect(select, {updateInject, deleteInject})(InjectPopover)