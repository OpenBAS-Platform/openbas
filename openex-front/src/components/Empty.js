import React from 'react';

const Empty = ({ message }) => (
  <div
    style={{
      display: 'table',
      height: '100%',
      width: '100%',
    }}
  >
    <span
      style={{
        display: 'table-cell',
        verticalAlign: 'middle',
        textAlign: 'center',
      }}
    >
      {message}
    </span>
  </div>
);

export default Empty;
