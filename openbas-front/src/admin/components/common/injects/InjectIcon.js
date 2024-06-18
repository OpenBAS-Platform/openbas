import React from 'react';
import * as PropTypes from 'prop-types';
import { HelpOutlined } from '@mui/icons-material';
import CustomTooltip from '../../../../components/CustomTooltip';

const iconSelector = (type, variant, fontSize, done, disabled) => {
  if (!type) {
    return (
      <HelpOutlined
        style={{
          marginTop: variant === 'list' ? 5 : 0,
          width: fontSize === 'small' || variant === 'inline' ? 20 : 24,
          height: fontSize === 'small' || variant === 'inline' ? 20 : 24,
          borderRadius: 4,
          filter: `brightness(${disabled ? '30%' : '100%'})`,
        }}
      />
    );
  }
  return (
    <img
      src={`/api/images/injectors/${type}`}
      alt={type}
      style={{
        marginTop: variant === 'list' ? 5 : 0,
        padding: variant === 'timeline' ? 1 : 0,
        cursor: 'pointer',
        width: fontSize === 'small' || variant === 'inline' ? 20 : 24,
        height: fontSize === 'small' || variant === 'inline' ? 20 : 24,
        borderRadius: 4,
        filter: `brightness(${disabled ? '30%' : '100%'})`,
      }}
    />
  );
};

const InjectIcon = (props) => {
  const { type, size, variant, tooltip, done, disabled, onClick } = props;
  const fontSize = size || 'medium';
  if (tooltip) {
    return (
      <CustomTooltip title={tooltip} onClick={onClick}>
        {iconSelector(type, variant, fontSize, done, disabled)}
      </CustomTooltip>
    );
  }
  return iconSelector(type, variant, fontSize, done, disabled);
};

InjectIcon.propTypes = {
  type: PropTypes.string,
  size: PropTypes.string,
  tooltip: PropTypes.node,
  variant: PropTypes.string,
  done: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

export default InjectIcon;
