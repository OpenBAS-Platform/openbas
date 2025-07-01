import { useFormatter } from '../../../../../../components/i18n';
import { type EndpointOutput } from '../../../../../../utils/api-types';

type Props = { endpoint: EndpointOutput };

const EndpointArchFragment = (props: Props) => {
  const { t } = useFormatter();
  return props.endpoint.endpoint_arch ?? t('Unknown');
};

export default EndpointArchFragment;
