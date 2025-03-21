import { ContentCopyOutlined } from '@mui/icons-material';
import { type FunctionComponent } from 'react';
import { makeStyles } from 'tss-react/mui';

import { truncate } from '../utils/String';
import { copyToClipboard } from '../utils/utils';
import { useFormatter } from './i18n';

const useStyles = makeStyles()(theme => ({
  containerInline: {
    position: 'relative',
    padding: '2px 25px 2px 5px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    backgroundColor: theme.palette.background.accent,
    fontFamily: 'Consolas, monaco, monospace',
    fontSize: 12,
  },
  container: {
    position: 'relative',
    paddingRight: 18,
  },
  icon: {
    'position': 'absolute',
    'right': 0,
    'top': 0,
    'cursor': 'pointer',
    '&:hover': { color: theme.palette.primary.main },
  },
  iconInline: {
    'position': 'absolute',
    'right': 5,
    'top': 4,
    'cursor': 'pointer',
    '&:hover': { color: theme.palette.primary.main },
  },
}));

interface ItemCopyProps {
  content: string;
  variant?: string;
  limit?: number;
}

const ItemCopy: FunctionComponent<ItemCopyProps> = ({
  content,
  variant,
  limit = null,
}) => {
  const { t } = useFormatter();
  const { classes } = useStyles();
  return (
    <div
      className={
        variant === 'inLine' ? classes.containerInline : classes.container
      }
    >
      {limit ? truncate(content, limit) : content}
      <span
        className={variant === 'inLine' ? classes.iconInline : classes.icon}
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          copyToClipboard(t, content);
        }}
      >
        <ContentCopyOutlined
          color="primary"
          sx={{ fontSize: variant === 'inLine' ? 12 : 18 }}
        />
      </span>
    </div>
  );
};
export default ItemCopy;
