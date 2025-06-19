import { Chip, Tooltip } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { type EsEndpoint } from '../../../../../../utils/api-types';

type Props = { endpoint: EsEndpoint };

const AssetTypeFragment = (props: Props) => {
  const useStyles = makeStyles()(() => ({
    typeChip: {
      height: 20,
      borderRadius: 4,
      textTransform: 'uppercase',
      width: 100,
      marginBottom: 5,
    },
  }));

  const { classes } = useStyles();
  return (
    <Tooltip title={props.endpoint.base_entity}>
      <Chip
        variant="outlined"
        className={classes.typeChip}
        label={props.endpoint.base_entity}
      />
    </Tooltip>
  );
};

export default AssetTypeFragment;
