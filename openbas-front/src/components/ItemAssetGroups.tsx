import { Chip, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { hexToRGB } from '../utils/Colors';
import { truncate } from '../utils/String';

const useStyles = makeStyles(() => ({
  inline: {
    display: 'inline',
    alignItems: 'center',
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  asset_group: {
    height: 20,
    fontSize: 12,
    margin: '0 7px 7px 0',
    borderRadius: 4,
  },
}));
interface ItemAssetGroupsProps {
  assetGroups: Record<string, string>; // Object with keys and values as strings
}
const ItemAssetGroups: React.FC<ItemAssetGroupsProps> = ({ assetGroups }) => {
  const classes = useStyles();
  const style = classes.asset_group;
  const truncateLimit = 15;

  return (
    <div className={classes.inline}>
      {Object.entries(assetGroups).map(([id, label], index) => (
        <span key={index}>
          <Tooltip title={label}>
            <Chip
              key={id}
              variant="outlined"
              classes={{ root: style }}
              label={truncate(label, truncateLimit)}
              style={{
                color: '#ffffff',
                borderColor: '#ffffff',
                backgroundColor: hexToRGB('transparent'),
              }}
            />
          </Tooltip>
        </span>
      ))}
    </div>
  );
};

export default ItemAssetGroups;
