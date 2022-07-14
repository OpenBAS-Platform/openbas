import React from 'react';
import * as PropTypes from 'prop-types';
import Tooltip from '@mui/material/Tooltip';
import { truncate } from '../utils/String';

const TruncatedContent = (props) => {
  const { content, limit } = props;
  return (
    <Tooltip title={content}>
      <span>{truncate(content, limit)}</span>
    </Tooltip>
  );
};

TruncatedContent.propTypes = {
  content: PropTypes.string,
  limit: PropTypes.number,
};

export default TruncatedContent;
