import { useFormatter } from '../../../../../../components/i18n';
import { type EsEndpoint } from '../../../../../../utils/api-types';

type Props = { endpoint: EsEndpoint };

const EndpointArchFragment = (props: Props) => {
  const { t } = useFormatter();
  return props.endpoint.endpoint_arch ?? t('Unknown');
};

export default EndpointArchFragment;
