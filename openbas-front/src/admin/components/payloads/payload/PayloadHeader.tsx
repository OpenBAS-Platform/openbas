import { Payload } from '../../../../utils/api-types';
import { FunctionComponent } from 'react';
import { Tooltip, Typography } from '@mui/material';
import { truncate } from '../../../../utils/String';
import { useHelper } from '../../../../store';
import type { DocumentHelper, UserHelper } from '../../../../actions/helper';
import PayloadPopover from '../PayloadPopover';
import type { CollectorHelper } from '../../../../actions/collectors/collector-helper';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { fetchDocuments } from '../../../../actions/Document';
import { fetchCollectors } from '../../../../actions/Collector';
import { useAppDispatch } from '../../../../utils/hooks';

interface Props { payload: Payload }

const PayloadHeader: FunctionComponent<Props> = ({ payload }) => {
  // Standard hooks
  const dispatch = useAppDispatch();

  // Fetching data
  const { documentsMap, collectorsMap, userAdmin } = useHelper((helper: DocumentHelper & CollectorHelper & UserHelper) => ({
    documentsMap: helper.getDocumentsMap(),
    collectorsMap: helper.getCollectorsMap(),
    userAdmin: helper.getMeAdmin(),
  }));
  useDataLoader(() => {
    dispatch(fetchDocuments());
    dispatch(fetchCollectors());
  });

  const collector = payload.payload_collector ? collectorsMap[payload.payload_collector] : null;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
    >
      <Tooltip title={payload.payload_name}>
        <Typography
          variant="h1"
          gutterBottom
        >
          {truncate(payload.payload_name, 80)}
        </Typography>
      </Tooltip>
      <div>
        {userAdmin && (
          <PayloadPopover
            documentsMap={documentsMap}
            payload={payload}
            disableUpdate={collector !== null}
            disableDelete={collector !== null && payload.payload_status !== 'DEPRECATED'}
          />
        )}
      </div>
    </div>
  );
};

export default PayloadHeader;
