import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import {
  EmailOutlined,
  SmsOutlined,
  NotificationsActiveOutlined,
  HelpOutlined,
} from '@mui/icons-material';

const iconSelector = (type, variant, fontSize, color) => {
  let style = {};
  switch (variant) {
    case 'inline':
      style = {
        color,
        width: 20,
        height: 20,
        margin: '0 7px 0 0',
        float: 'left',
      };
      break;
    default:
      style = {
        color,
      };
  }

  switch (type) {
    case 'openex_email':
      return <EmailOutlined style={style} fontSize={fontSize} />;
    case 'openex_ovh_sms':
      return <SmsOutlined style={style} fontSize={fontSize} />;
    case 'openex_manual':
      return <NotificationsActiveOutlined style={style} fontSize={fontSize} />;
    default:
      return <HelpOutlined style={style} fontSize={fontSize} />;
  }
};

class InjectIcon extends Component {
  render() {
    const {
      type, size, variant, color,
    } = this.props;
    const fontSize = size || 'medium';
    return iconSelector(type, variant, fontSize, color);
  }
}

InjectIcon.propTypes = {
  type: PropTypes.string,
  size: PropTypes.string,
  variant: PropTypes.string,
  color: PropTypes.string,
};

export default InjectIcon;
