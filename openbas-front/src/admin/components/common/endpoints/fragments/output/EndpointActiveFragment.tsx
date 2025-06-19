import { Tooltip } from '@mui/material';

import { useFormatter } from '../../../../../../components/i18n';
import { type EndpointOutput } from '../../../../../../utils/api-types';
import { getActiveMsgTooltip } from '../../../../../../utils/endpoints/utils';
import AssetStatus from '../../../../assets/AssetStatus';

type Props = { endpoint: EndpointOutput };

const EndpointActiveFragment = (props: Props) => {
  const { t } = useFormatter();
  const status = getActiveMsgTooltip(props.endpoint, t('Active'), t('Inactive'), t('Agentless'));
  return (
    <Tooltip title={status.activeMsgTooltip}>
      <span>
        <AssetStatus variant="list" status={status.status} />
      </span>
    </Tooltip>
  );
};

export default EndpointActiveFragment;
