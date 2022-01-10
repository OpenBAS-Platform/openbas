import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { deepOrange, purple, teal } from '@mui/material/colors';
import {
  EmailOutlined,
  SmsOutlined,
  NotificationsActiveOutlined,
  HelpOutlined,
} from '@mui/icons-material';

const iconSelector = (type, variant, fontSize) => {
  let style = {};
  switch (variant) {
    case 'inline':
      style = {
        width: 20,
        height: 20,
        margin: '0 7px 0 0',
        float: 'left',
      };
      break;
    default:
      style = {
        margin: 0,
      };
  }

  switch (type) {
    case 'openex_email':
      return (
        <EmailOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: deepOrange[500] }}
        />
      );
    case 'openex_ovh_sms':
      return (
        <SmsOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: purple[500] }}
        />
      );
    case 'openex_manual':
      return (
        <NotificationsActiveOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: teal[500] }}
        />
      );
    default:
      return <HelpOutlined style={style} fontSize={fontSize} />;
  }
};

class InjectIcon extends Component {
  render() {
    const { type, size, variant } = this.props;
    const fontSize = size || 'medium';
    return iconSelector(type, variant, fontSize);
  }
}

InjectIcon.propTypes = {
  type: PropTypes.string,
  size: PropTypes.string,
  tooltip: PropTypes.string,
  variant: PropTypes.string,
};

export default InjectIcon;
