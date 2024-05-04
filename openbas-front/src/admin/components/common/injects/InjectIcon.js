import React from 'react';
import * as PropTypes from 'prop-types';
import CustomTooltip from '../../../../components/CustomTooltip';

const iconSelector = (type, variant, fontSize, done, disabled) => {
  return (
    <img
      src={`/api/images/injectors/${type}`}
      alt={type}
      style={{
        marginTop: variant === 'list' ? 5 : 0,
        width: fontSize === 'small' || variant === 'inline' ? 20 : 24,
        height: fontSize === 'small' || variant === 'inline' ? 20 : 24,
        borderRadius: 4,
        filter: `brightness(${disabled ? '30%' : '100%'})`,
      }}
    />
  );
};

const InjectIcon = (props) => {
  const { type, size, variant, tooltip, done, disabled } = props;
  const fontSize = size || 'medium';
  if (tooltip) {
    return (
      <CustomTooltip title={tooltip}>
        {iconSelector(type, variant, fontSize, done, disabled)}
      </CustomTooltip>
    );
  }
  return iconSelector(type, variant, fontSize, done, disabled);
};

InjectIcon.propTypes = {
  type: PropTypes.string,
  size: PropTypes.string,
  tooltip: PropTypes.string,
  variant: PropTypes.string,
  done: PropTypes.bool,
};

export default InjectIcon;
