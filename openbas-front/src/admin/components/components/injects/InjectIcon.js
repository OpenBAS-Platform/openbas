import React from 'react';
import * as PropTypes from 'prop-types';
import { ApiOutlined, EmailOutlined, EmojiEventsOutlined, HelpOutlined, NotificationsActiveOutlined, SmsOutlined, SpeakerNotesOutlined } from '@mui/icons-material';
import { Mastodon, NewspaperVariantMultipleOutline, Twitter } from 'mdi-material-ui';
import { useTheme } from '@mui/styles';
import CustomTooltip from '../../../../components/CustomTooltip';
import { useHelper } from '../../../../store';
import octiDark from '../../../../static/images/xtm/octi_dark.png';
import octiLight from '../../../../static/images/xtm/octi_light.png';

const iconSelector = (type, variant, fontSize, done, disabled, contractImage) => {
  const theme = useTheme();
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
    case 'openbas_email':
      return (
        <EmailOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: color || '#cddc39' }}
        />
      );
    case 'openbas_ovh_sms':
      return (
        <SmsOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: color || '#9c27b0' }}
        />
      );
    case 'openbas_manual':
      return (
        <NotificationsActiveOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: color || '#009688' }}
        />
      );
    case 'openbas_mastodon':
      return (
        <Mastodon
          style={style}
          fontSize={fontSize}
          sx={{ color: color || '#ad1457' }}
        />
      );
    case 'openbas_lade':
      return (
        <img
          src={contractImage}
          alt="Airbus Lade"
          style={{
            width: fontSize === 'small' || variant === 'inline' ? 20 : 24,
            height: fontSize === 'small' || variant === 'inline' ? 20 : 24,
          }}
        />
      );
    case 'openbas_opencti':
      return (
        <img
          src={theme.palette.mode === 'dark' ? octiDark : octiLight}
          alt="OpenCTI"
          style={{
            width: fontSize === 'small' || variant === 'inline' ? 20 : 24,
            height: fontSize === 'small' || variant === 'inline' ? 20 : 24,
          }}
        />
      );
    case 'openbas_gnu_social':
      return (
        <SpeakerNotesOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: color || '#f44336' }}
        />
      );
    case 'openbas_twitter':
      return (
        <Twitter
          style={style}
          fontSize={fontSize}
          sx={{ color: color || '#2196f3' }}
        />
      );
    case 'openbas_http':
      return (
        <ApiOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: color || '#00bcd4' }}
        />
      );
    case 'openbas_channel':
      return (
        <NewspaperVariantMultipleOutline
          style={style}
          fontSize={fontSize}
          sx={{ color: done ? '#4caf50' : '#ff9800' }}
        />
      );
    case 'openbas_challenge':
      return (
        <EmojiEventsOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: done ? '#4caf50' : '#e91e63' }}
        />
      );
    case 'openbas_caldera':
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
  const { type, size, variant, tooltip, done, disabled } = props;

  const {
    contractImages,
  } = useHelper((helper) => {
    return {
      contractImages: helper.getContractImages(),
    };
  });
  const contractImage = `data:image/png;charset=utf-8;base64, ${contractImages[type]}`;
  const fontSize = size || 'medium';
  if (tooltip) {
    return (
      <CustomTooltip title={tooltip}>
        {iconSelector(type, variant, fontSize, done, disabled, contractImage)}
      </CustomTooltip>
    );
  }
  return iconSelector(type, variant, fontSize, done, disabled, contractImage);
};

InjectIcon.propTypes = {
  type: PropTypes.string,
  size: PropTypes.string,
  tooltip: PropTypes.string,
  variant: PropTypes.string,
  done: PropTypes.bool,
};

export default InjectIcon;
