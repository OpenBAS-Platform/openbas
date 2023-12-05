import React, { useState } from 'react';
import * as PropTypes from 'prop-types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { compose } from 'ramda';
import withTheme from '@mui/styles/withTheme';
import { truncate } from '../utils/String';

export const MarkDownComponents = (theme) => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  table: ({ node, ...tableProps }) => (
    <table
      style={{
        border: `1px solid ${theme.palette.divider}`,
        borderCollapse: 'collapse',
      }}
      {...tableProps}
    />
  ),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tr: ({ node, ...trProps }) => (
    <tr style={{ border: `1px solid ${theme.palette.divider}` }} {...trProps} />
  ),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  td: ({ node, ...tdProps }) => (
    <td
      style={{
        border: `1px solid ${theme.palette.divider}`,
        padding: 5,
      }}
      {...tdProps}
    />
  ),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  th: ({ node, ...tdProps }) => (
    <th
      style={{
        border: `1px solid ${theme.palette.divider}`,
        padding: 5,
      }}
      {...tdProps}
    />
  ),
});

const ExpandableMarkdown = (props) => {
  const [expand, setExpand] = useState(false);

  const onClick = () => setExpand(!expand);

  const { source, limit, theme, isExpanded, controlled } = props;
  const shouldBeTruncated = (source || '').length > limit;

  return (
    <div style={{ position: 'relative' }}>
      {shouldBeTruncated && !controlled && (
        <div style={{ position: 'absolute', top: -32, right: 0 }}>
          <IconButton onClick={onClick} size="large">
            {expand ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </div>
      )}
      <div style={{ marginTop: 10 }}>
        <Markdown
          remarkPlugins={[remarkGfm, remarkParse]}
          parserOptions={{ commonmark: true }}
          components={MarkDownComponents(theme)}
          className="markdown"
          {...props}
        >
          {expand || isExpanded ? source : truncate(source, limit)}
        </Markdown>
      </div>
      <div className="clearfix" />
    </div>
  );
};

ExpandableMarkdown.propTypes = {
  source: PropTypes.string.isRequired,
  limit: PropTypes.number.isRequired,
  controlled: PropTypes.bool,
  isExpanded: PropTypes.bool,
};

export default compose(withTheme)(ExpandableMarkdown);
