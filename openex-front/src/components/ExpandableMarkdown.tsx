import React, { useState } from 'react';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { truncate } from '../utils/String';
import MDEditor from '@uiw/react-md-editor/nohighlight';
import { Theme } from './Theme';
import { useTheme } from '@mui/material';

interface MardDownComponentProps {
  node?: unknown
}

export const MarkDownComponents = (theme: Theme) => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  table: ({ node, ...tableProps }: MardDownComponentProps) => (
    <table
      style={{
        border: `1px solid ${theme.palette.divider}`,
        borderCollapse: 'collapse',
      }}
      {...tableProps}
    />
  ),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tr: ({ node, ...trProps }: MardDownComponentProps) => (
    <tr style={{ border: `1px solid ${theme.palette.divider}` }} {...trProps} />
  ),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  td: ({ node, ...tdProps }: MardDownComponentProps) => (
    <td
      style={{
        border: `1px solid ${theme.palette.divider}`,
        padding: 5,
      }}
      {...tdProps}
    />
  ),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  th: ({ node, ...tdProps }: MardDownComponentProps) => (
    <th
      style={{
        border: `1px solid ${theme.palette.divider}`,
        padding: 5,
      }}
      {...tdProps}
    />
  ),
});

interface Props {
  source: string
  limit: number
  controlled?: boolean
  isExpanded?: boolean
}

const ExpandableMarkdow: React.FC<Props> = ({ source, limit, isExpanded, controlled }) => {
  const [expand, setExpand] = useState(false);
  const theme = useTheme<Theme>();
  const onClick = () => setExpand(!expand);
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
      <div style={{ marginTop: 10 }} data-color-mode={theme.palette.mode}>
        <MDEditor.Markdown
          source={expand || isExpanded ? source : truncate(source, limit)}
          remarkPlugins={[remarkGfm, remarkParse]}
          components={MarkDownComponents(theme)}
          className="markdown"
        />
      </div>
      <div className="clearfix" />
    </div>
  );
};

export default ExpandableMarkdow;
