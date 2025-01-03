import { Tooltip, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router';

import { EndpointHelper } from '../../../../../actions/assets/asset-helper';
import type { UserHelper } from '../../../../../actions/helper';
import { useHelper } from '../../../../../store';
import type { Endpoint as EndpointType } from '../../../../../utils/api-types';
import { truncate } from '../../../../../utils/String';
import EndpointPopover from '../EndpointPopover';

const useStyles = makeStyles(() => ({
  title: {
    float: 'left',
    marginRight: 10,
  },
  actions: {
    margin: '-6px 0 0 0',
    float: 'right',
  },
}));

const EndpointHeader = () => {
  // Standard hooks
  const classes = useStyles();
  const { endpointId } = useParams() as { endpointId: EndpointType['asset_id'] };

  // Fetching data
  const { userAdmin, endpoint } = useHelper((helper: EndpointHelper & UserHelper) => ({
    userAdmin: helper.getMe()?.user_admin ?? false,
    endpoint: helper.getEndpoint(endpointId),
  }));

  return (
    <>
      <Tooltip title={endpoint.asset_name}>
        <Typography
          variant="h1"
          gutterBottom={true}
          classes={{ root: classes.title }}
        >
          {truncate(endpoint.asset_name, 80)}
        </Typography>
      </Tooltip>
      <div className={classes.actions}>
        {userAdmin && (
          <EndpointPopover
            endpoint={{ ...endpoint, type: 'static' }}
            onUpdate={endpoint}
            onDelete={endpoint}
          />
        )}
      </div>
      <div className="clearfix" />
    </>
  );
};

export default EndpointHeader;
