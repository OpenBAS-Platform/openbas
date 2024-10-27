import * as PropTypes from 'prop-types';
import { Tooltip } from '@mui/material';
import { truncate } from '../utils/String';

const TruncatedText = (props) => {
  const { content, limit } = props;
  return (
    <Tooltip title={content}>
      <span>{truncate(content, limit)}</span>
    </Tooltip>
  );
};

TruncatedText.propTypes = {
  content: PropTypes.string,
  limit: PropTypes.number,
};

export default TruncatedText;
