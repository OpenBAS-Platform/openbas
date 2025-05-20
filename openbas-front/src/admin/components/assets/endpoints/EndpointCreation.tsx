import { type FunctionComponent, useState } from 'react';

import { addEndpoint } from '../../../../actions/assets/endpoint-actions';
import ButtonCreate from '../../../../components/common/ButtonCreate';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import type { Endpoint, EndpointInput } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import EndpointForm from './EndpointForm';

interface Props {
  editing?: boolean;
  agentless?: boolean;
  onCreate?: (result: Endpoint) => void;
}

const EndpointCreation: FunctionComponent<Props> = ({
  editing,
  agentless,
  onCreate,
}) => {
  // Standard hooks
  const [open, setOpen] = useState(false);
  const { t } = useFormatter();

  const dispatch = useAppDispatch();
  const onSubmit = (data: EndpointInput) => {
    dispatch(addEndpoint(data)).then(
      (result: {
        result: string;
        entities: { endpoints: Record<string, Endpoint> };
      }) => {
        if (result.entities) {
          if (onCreate) {
            const endpointCreated = result.entities.endpoints[result.result];
            onCreate(endpointCreated);
          }
          setOpen(false);
        }
        return result;
      },
    );
  };

  return (
    <>
      <ButtonCreate onClick={() => setOpen(true)} />
      {editing ? (
        <Drawer
          open={open}
          handleClose={() => setOpen(false)}
          title={t('Update an endpoint')}
        >
          <EndpointForm
            onSubmit={onSubmit}
            handleClose={() => setOpen(false)}
          />
        </Drawer>
      ) : (
        <Drawer
          open={open}
          handleClose={() => setOpen(false)}
          title={t('Create a new endpoint')}
        >
          <EndpointForm
            onSubmit={onSubmit}
            agentless={agentless}
            handleClose={() => setOpen(false)}
          />
        </Drawer>
      )}
    </>
  );
};

export default EndpointCreation;
