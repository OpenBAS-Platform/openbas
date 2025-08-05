import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { findEndpoints } from '../../../../../../actions/assets/endpoint-actions';
import type { EndpointOutput } from '../../../../../../utils/api-types';
import EndpointPopover from '../../../../assets/endpoints/EndpointPopover';
import EndpointsList from '../../../../assets/endpoints/EndpointsList';
import InjectAddEndpoints from '../../../../simulations/simulation/injects/endpoints/InjectAddEndpoints';

interface Props {
  name: string;
  platforms?: string[];
  architectures?: string;
  disabled?: boolean;
  errorLabel?: string | null;
  label?: string | boolean;
}
const InjectEndpointsList = ({ name, platforms = [], architectures, disabled = false, errorLabel, label }: Props) => {
  const { control, setValue } = useFormContext();
  const endpointIds = useWatch({
    control,
    name,
  }) as string[];

  const [endpoints, setEndpoints] = useState<EndpointOutput[]>([]);
  useEffect(() => {
    if (endpointIds.length > 0) {
      findEndpoints(endpointIds).then(result => setEndpoints(result.data));
    } else {
      setEndpoints([]);
    }
  }, [endpointIds]);

  const onEndpointChange = (endpointIds: string[]) => setValue(name, endpointIds, { shouldValidate: true });
  const onRemoveEndpoint = (endpointId: string) => setValue(name, endpointIds.filter(id => id !== endpointId), { shouldValidate: true });

  return (
    <>
      <EndpointsList
        endpoints={endpoints}
        renderActions={endpoint => (
          <EndpointPopover
            inline
            agentless={endpoint.asset_agents.length === 0}
            endpoint={endpoint}
            onRemoveFromContext={onRemoveEndpoint}
            removeFromContextLabel="Remove from the inject"
            onDelete={onRemoveEndpoint}
            disabled={disabled}
          />
        )}
      />
      <InjectAddEndpoints
        endpointIds={endpointIds}
        onSubmit={onEndpointChange}
        platforms={platforms}
        payloadArch={architectures}
        disabled={disabled}
        errorLabel={errorLabel}
        label={label}
      />
    </>
  );
};

export default InjectEndpointsList;
