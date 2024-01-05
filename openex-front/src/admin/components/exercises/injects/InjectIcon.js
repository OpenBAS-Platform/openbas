import React from 'react';
import * as PropTypes from 'prop-types';
import { ApiOutlined, EmailOutlined, EmojiEventsOutlined, HelpOutlined, NotificationsActiveOutlined, SmsOutlined, SpeakerNotesOutlined } from '@mui/icons-material';
import { Mastodon, NewspaperVariantMultipleOutline, Twitter } from 'mdi-material-ui';
import Airbus from '../../../../static/images/contracts/airbus.png';
import CustomTooltip from '../../../../components/CustomTooltip';
import { fileUri } from '../../../../utils/Environment';
import { useHelper } from "../../../../store.ts";

const iconSelector = (type, variant, fontSize, done, disabled, contractImage) => {
  let style;
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
  let color = null;
  if (done) {
    color = '#4caf50';
  } else if (disabled) {
    color = '#7a7a7a';
  }
  switch (type) {
    case 'openex_email':
      return (
        <EmailOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: color || '#cddc39' }}
        />
      );
    case 'openex_ovh_sms':
      return (
        <SmsOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: color || '#9c27b0' }}
        />
      );
    case 'openex_manual':
      return (
        <NotificationsActiveOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: color || '#009688' }}
        />
      );
    case 'openex_mastodon':
      return (
        <Mastodon
          style={style}
          fontSize={fontSize}
          sx={{ color: color || '#ad1457' }}
        />
      );
    case 'openex_lade':
      return (
        <img
          src={fileUri(Airbus)}
          alt="Airbus Lade"
          style={{
            width: fontSize === 'small' || variant === 'inline' ? 20 : 24,
            height: fontSize === 'small' || variant === 'inline' ? 20 : 24,
          }}
        />
      );
    case 'openex_gnu_social':
      return (
        <SpeakerNotesOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: color || '#f44336' }}
        />
      );
    case 'openex_twitter':
      return (
        <Twitter
          style={style}
          fontSize={fontSize}
          sx={{ color: color || '#2196f3' }}
        />
      );
    case 'openex_http':
      return (
        <ApiOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: color || '#00bcd4' }}
        />
      );
    case 'openex_channel':
      return (
        <NewspaperVariantMultipleOutline
          style={style}
          fontSize={fontSize}
          sx={{ color: done ? '#4caf50' : '#ff9800' }}
        />
      );
    case 'openex_challenge':
      return (
        <EmojiEventsOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: done ? '#4caf50' : '#e91e63' }}
        />
      );
    case 'openex_caldera':
      return (
        <img
          src={contractImage}
          alt="Caldera"
          style={{
            width: fontSize === 'small' || variant === 'inline' ? 20 : 24,
            height: fontSize === 'small' || variant === 'inline' ? 20 : 24,
          }}
        />
      );
    default:
      return <HelpOutlined style={style} fontSize={fontSize} />;
  }
};

const InjectIcon = (props) => {
  const { type, size, variant, tooltip, done, disabled} = props;

  let contractImage;
  const {
    contractImages,
  } = useHelper((helper) => {
    return {
      contractImages: helper.getContractImages(),
    };
  });
  contractImage = "data:image/png;charset=utf-8;base64, "+contractImages[type];
  const fontSize = size || 'medium';
  if (tooltip) {
    return (
      <CustomTooltip title={tooltip}>
        {iconSelector(type, variant, fontSize, done, disabled, contractImage)}
      </CustomTooltip>
    );
  }
  return iconSelector(type, variant, fontSize, done, disabled, contractImage);
}

InjectIcon.propTypes = {
  type: PropTypes.string,
  size: PropTypes.string,
  tooltip: PropTypes.string,
  variant: PropTypes.string,
  done: PropTypes.bool,
};

export default InjectIcon;
