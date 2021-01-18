import React from 'react';
import * as PropTypes from 'prop-types';
import {
  LocalMovies,
  Computer,
  KeyboardArrowRight,
  KeyboardArrowLeft,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Person,
  Group,
  Notifications,
  Public,
  School,
  Add,
  FileCopy,
  Mail,
  RemoveCircle,
  Delete,
  Flag,
  Settings,
  Schedule,
  Event,
  ExitToApp,
  CheckCircle,
  Done,
  DoneAll,
  Description,
  Rowing,
  Input,
  MoreVert,
  MoreHoriz,
  ArrowDropDown,
  ArrowDropUp,
  Cancel,
  AssignmentTurnedIn,
  Folder,
  CloudDownload,
  AttachFile,
  InsertChart,
  Layers,
  Sms,
  NetworkCheck,
  OndemandVideo,
  CenterFocusStrong,
  CenterFocusWeak,
  PlayArrow,
  SlowMotionVideo,
  PlayCircleOutline,
  Note,
  CallToAction,
  GraphicEq,
  DateRange,
  AccessTime,
  Edit,
  RemoveRedEye,
} from '@material-ui/icons';
import * as Constants from '../constants/ComponentTypes';

const iconStyle = {
  [Constants.ICON_TYPE_NAVBAR]: {
    margin: 0,
    padding: 0,
    left: '19px',
    top: '8px',
  },
  [Constants.ICON_TYPE_SORT]: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '16px',
  },
  [Constants.ICON_TYPE_LIST]: {
    position: 'absolute',
    top: '18px',
    left: '10px',
  },
  [Constants.ICON_TYPE_MAINLIST]: {
    position: 'absolute',
    padding: 0,
    top: '8px',
  },
  [Constants.ICON_TYPE_MAINLIST2]: {
    position: 'absolute',
    padding: 0,
    top: '18px',
  },
  [Constants.ICON_TYPE_MAINLIST_RIGHT]: {
    position: 'absolute',
    top: '20px',
  },
  [Constants.ICON_TYPE_LEFT]: {
    float: 'left',
    margin: '10px 5px 0px 0px',
  },
};

// eslint-disable-next-line import/prefer-default-export
export const Icon = (props) => {
  const mergeStyle = { ...props.style, ...iconStyle[props.type] };
  switch (props.name) {
    case Constants.ICON_NAME_DOCUMENT_ACTION_DELETE:
      return <Delete style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_DOCUMENT_ACTION_EXPORT:
      return <CloudDownload style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_DOCUMENT_ACTION_VIEW:
      return <RemoveRedEye style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_DOCUMENT_ACTION_EDIT:
      return <Edit style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_LOCAL_MOVIES:
      return <LocalMovies style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_HARDWARE_COMPUTER:
      return <Computer style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_HARDWARE_KEYBOARD_ARROW_RIGHT:
      return <KeyboardArrowRight style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_HARDWARE_KEYBOARD_ARROW_LEFT:
      return <KeyboardArrowLeft style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_HARDWARE_KEYBOARD_ARROW_UP:
      return <KeyboardArrowUp style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_HARDWARE_KEYBOARD_ARROW_DOWN:
      return <KeyboardArrowDown style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_SOCIAL_PERSON:
      return <Person style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_TESTS:
      return <Notifications style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_SOCIAL_GROUP:
      return <Group style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_SOCIAL_PUBLIC:
      return <Public style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_SOCIAL_SCHOOL:
      return <School style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_CONTENT_ADD:
      return <Add style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_CONTENT_COPY:
      return <FileCopy style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_CONTENT_MAIL:
      return <Mail style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_CONTENT_FLAG:
      return <Flag style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_CONTENT_REMOVE_CIRCLE:
      return <RemoveCircle style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_ACTION_DELETE:
      return <Delete style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_ACTION_SETTINGS:
      return <Settings style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_ACTION_DOCUMENTS:
      return <nDocuments style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_ACTION_SCHEDULE:
      return <Schedule style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_ACTION_EVENT:
      return <Event style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_ACTION_EXIT_TO_APP:
      return <ExitToApp style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_ACTION_ASSIGNMENT_TURNED_IN:
      return <AssignmentTurnedIn style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_ACTION_CHECK_CIRCLE:
      return <CheckCircle style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_ACTION_DONE:
      return <Done style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_ACTION_DONE_ALL:
      return <DoneAll style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_ACTION_DESCRIPTION:
      return <Description style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_ACTION_ROWING:
      return <Rowing style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_ACTION_INPUT:
      return <Input style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_NAVIGATION_MORE_VERT:
      return <MoreVert style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_NAVIGATION_MORE_HORIZ:
      return <MoreHoriz style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_NAVIGATION_ARROW_DROP_DOWN:
      return <ArrowDropDown style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_NAVIGATION_ARROW_DROP_UP:
      return <ArrowDropUp style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_NAVIGATION_CANCEL:
      return <Cancel style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_FILE_FOLDER:
      return <Folder style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_FILE_FILE_DOWNLOAD:
      return <CloudDownload style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_MAPS_LAYERS:
      return <Layers style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_NOTIFICATION_SMS:
      return <Sms style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_NOTIFICATION_NETWORK_CHECK:
      return <NetworkCheck style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_NOTIFICATION_ONDEMAND_VIDEO:
      return <OndemandVideo style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_EDITOR_ATTACH_FILE:
      return <AttachFile style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_EDITOR_INSERT_CHART:
      return <InsertChart style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_IMAGE_CENTER_FOCUS_STRONG:
      return <CenterFocusStrong style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_IMAGE_CENTER_FOCUS_WEAK:
      return <CenterFocusWeak style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_AV_PLAY_ARROW:
      return <PlayArrow style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_AV_SLOW_MOTION_VIDEO:
      return <SlowMotionVideo style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_AV_PLAY_CIRCLE_OUTLINE:
      return <PlayCircleOutline style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_AV_NOTE:
      return <Note style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_AV_CALL_TO_ACTION:
      return <CallToAction style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_DEVICE_GRAPHIC_EQ:
      return <GraphicEq style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_DATE_RANGE:
      return <DateRange style={mergeStyle} color={props.color} />;
    case Constants.ICON_NAME_ACCESS_TIME:
      return <AccessTime style={mergeStyle} color={props.color} />;
    default:
      return <Computer style={mergeStyle} color={props.color} />;
  }
};

Icon.propTypes = {
  name: PropTypes.string,
  type: PropTypes.string,
  style: PropTypes.object,
  color: PropTypes.string,
};
