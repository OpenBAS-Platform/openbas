import React, { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';

export default function CustomTooltip({ children, ...rest }) {
  const [renderTooltip, setRenderTooltip] = useState(false);
  return (
    <div
      onMouseEnter={() => !renderTooltip && setRenderTooltip(true)}
      className="display-contents"
    >
      {!renderTooltip && children}
      {renderTooltip && <Tooltip {...rest}>{children}</Tooltip>}
    </div>
  );
}
