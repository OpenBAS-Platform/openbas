import { FunctionComponent, useState } from 'react';

import ButtonPopover from '../../../../../components/common/ButtonPopover';
import DialogDelete from '../../../../../components/common/DialogDelete';
import { useFormatter } from '../../../../../components/i18n';
import { Agent } from '../../../../../utils/api-types';

type AgentActionType = 'Update' | 'Delete';

interface Props {
  agent: Agent;
  actions: AgentActionType[];
  onDelete?: (result: string) => void;
  inList?: boolean;
}

const AtomicTestingPopover: FunctionComponent<Props> = ({
  agent,
  actions = [],
  onDelete,
  inList = false,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  // Deletion
  const [deletion, setDeletion] = useState(false);
  const handleOpenDelete = () => setDeletion(true);
  const handleCloseDelete = () => setDeletion(false);
  const submitDelete = () => {
    handleCloseDelete();
    onDelete;
  };

  // Button Popover
  const entries = [];
  if (actions.includes('Delete')) entries.push({ label: 'Delete', action: () => handleOpenDelete() });

  return (
    <>
      <ButtonPopover entries={entries} variant={inList ? 'icon' : 'toggle'} />
      {actions.includes('Delete')
      && (
        <DialogDelete
          open={deletion}
          handleClose={handleCloseDelete}
          handleSubmit={submitDelete}
          text={`${t('Do you want to delete this agent:')} ${agent.agent_id} ?`}
        />
      )}
    </>
  );
};

export default AtomicTestingPopover;
