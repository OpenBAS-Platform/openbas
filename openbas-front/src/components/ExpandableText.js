import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import * as PropTypes from 'prop-types';
import { useState } from 'react';

import { truncate } from '../utils/String';

const ExpandableHtml = (props) => {
  const [expand, setExpand] = useState(false);
  const onClick = () => setExpand(!expand);
  const { source, limit } = props;
  const shouldBeTruncated = (source || '').length > limit;
  return (
    <div style={{ position: 'relative' }}>
      {shouldBeTruncated && (
        <div style={{ position: 'absolute', top: -12, right: -5 }}>
          <IconButton onClick={onClick} size="large">
            {expand ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </div>
      )}
      <div style={{ marginTop: -5, whiteSpace: 'pre-line' }}>
        {expand ? source : truncate(source, limit)}
      </div>
      <div className="clearfix" />
    </div>
  );
};

ExpandableHtml.propTypes = {
  source: PropTypes.string.isRequired,
  limit: PropTypes.number.isRequired,
};

export default ExpandableHtml;
