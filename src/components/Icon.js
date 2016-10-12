import React, {PropTypes} from 'react';
import * as Constants from '../constants/ComponentTypes'
import LocalMovies from 'material-ui/svg-icons/maps/local-movies'
import HardwareComputer from 'material-ui/svg-icons/hardware/computer'
import SocialPerson from 'material-ui/svg-icons/social/person'
import SocialGroup from 'material-ui/svg-icons/social/group'
import SocialPublic from 'material-ui/svg-icons/social/public'
import ContentAdd from 'material-ui/svg-icons/content/add'
import ContentCopy from 'material-ui/svg-icons/content/content-copy'
import ContentMail from 'material-ui/svg-icons/content/mail'
import ContentFlag from 'material-ui/svg-icons/content/flag'
import ActionDelete from 'material-ui/svg-icons/action/delete'
import ActionSettings from 'material-ui/svg-icons/action/settings'
import ActionSchedule from 'material-ui/svg-icons/action/schedule'
import ActionEvent from 'material-ui/svg-icons/action/event'
import ActionExitToApp from 'material-ui/svg-icons/action/exit-to-app'
import ActionAssignmentTurnedIn from 'material-ui/svg-icons/action/assignment-turned-in'
import FileFolder from 'material-ui/svg-icons/file/folder'
import EditorAttachFile from 'material-ui/svg-icons/editor/attach-file'

const iconStyle = {
  [ Constants.ICON_TYPE_NAVBAR ]: {
    margin: 0,
    padding: 0,
    left: '19px',
    top: '8px'
  }
}

export const Icon = (props) => {
  const mergeStyle = Object.assign( {}, props.style, iconStyle[props.type])
  switch (props.name) {
    case Constants.ICON_NAME_LOCAL_MOVIES:
      return (<LocalMovies style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_HARDWARE_COMPUTER:
      return (<HardwareComputer style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_SOCIAL_PERSON:
      return (<SocialPerson style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_SOCIAL_GROUP:
      return (<SocialGroup style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_SOCIAL_PUBLIC:
      return (<SocialPublic style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_CONTENT_ADD:
      return (<ContentAdd style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_CONTENT_COPY:
      return (<ContentCopy style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_CONTENT_MAIL:
      return (<ContentMail style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_CONTENT_FLAG:
      return (<ContentFlag style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_ACTION_DELETE:
      return (<ActionDelete style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_ACTION_SETTINGS:
      return (<ActionSettings style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_ACTION_SCHEDULE:
      return (<ActionSchedule style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_ACTION_EVENT:
      return (<ActionEvent style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_ACTION_EXIT_TO_APP:
      return (<ActionExitToApp style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_ACTION_ASSIGNMENT_TURNED_IN:
      return (<ActionAssignmentTurnedIn style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_FILE_FOLDER:
      return (<FileFolder style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_EDITOR_ATTACH_FILE:
      return (<EditorAttachFile style={mergeStyle} color={props.color} />)
    default:
      return (<HardwareComputer style={mergeStyle} color={props.color} />)
  }
}

Icon.propTypes = {
  name: PropTypes.string,
  type: PropTypes.string,
  style: PropTypes.object,
  color: PropTypes.string
}