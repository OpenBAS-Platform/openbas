import React from 'react';
import * as PropTypes from 'prop-types';
import { HelpOutlineOutlined } from '@mui/icons-material';
import CustomTooltip from '../../../../components/CustomTooltip';
import { useFormatter } from '../../../../components/i18n';

const iconSelector = (type, isCollector, variant, fontSize, done, disabled, onClick) => {
  if (!type) {
    return (
      <HelpOutlineOutlined
        onClick={onClick}
        style={{
          marginTop: variant === 'list' ? 5 : 0,
          width: fontSize === 'small' || variant === 'inline' ? 20 : 24,
          height: fontSize === 'small' || variant === 'inline' ? 20 : 24,
          borderRadius: 4,
          cursor: onClick ? 'pointer' : 'default',
          filter: `${done ? 'filter:hue-rotate(100deg);' : `brightness(${disabled ? '30%' : '100%'})`}`,
        }}
      />
    );
  }
  if (isCollector) {
    return (
      <img
        onClick={onClick}
        src={`/api/images/collectors/${type}`}
        alt={type}
        style={{
          marginTop: variant === 'list' ? 5 : 0,
          padding: variant === 'timeline' ? 1 : 0,
          width: fontSize === 'small' || variant === 'inline' ? 20 : 24,
          height: fontSize === 'small' || variant === 'inline' ? 20 : 24,
          borderRadius: 4,
          cursor: onClick ? 'pointer' : 'default',
          filter: `${done ? 'filter:hue-rotate(100deg);' : `brightness(${disabled ? '30%' : '100%'})`}`,
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
        filter: `${done ? 'filter:hue-rotate(100deg);' : `brightness(${disabled ? '30%' : '100%'})`}`,
      }}
    />
  );
};

const InjectIcon = (props) => {
  const { t } = useFormatter();
  const { type, isCollector, size, variant, done, disabled, onClick } = props;
  const fontSize = size || 'medium';
  return (
    <CustomTooltip title={type ? t(type) : t('Unknown')}>
      {iconSelector(type, isCollector, variant, fontSize, done, disabled, onClick)}
    </CustomTooltip>
  );
};

InjectIcon.propTypes = {
  type: PropTypes.string,
  size: PropTypes.string,
  variant: PropTypes.string,
  done: PropTypes.bool,
  disabled: PropTypes.bool,
  isCollector: PropTypes.bool,
  onClick: PropTypes.func,
};

export default InjectIcon;
