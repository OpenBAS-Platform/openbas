import { Chip, Tooltip } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { type EndpointOutput } from '../../../../../../utils/api-types';
import {useTheme} from "@mui/material/styles";

type Props = { endpoint: EndpointOutput };

const AssetPlatformFragment = (props: Props) => {
  const theme = useTheme();
  const useStyles = makeStyles()(() => ({
    typeChip: {
      height: 20,
      borderRadius: 4,
      textTransform: 'uppercase',
      width: 100,
      marginBottom: theme.spacing(0),
    },
  }));

  const { classes } = useStyles();
  return (
    <Tooltip title={props.endpoint.asset_type}>
      <Chip
        variant="outlined"
        className={classes.typeChip}
        label={props.endpoint.asset_type}
      />
    </Tooltip>
  );
};

export default AssetPlatformFragment;
