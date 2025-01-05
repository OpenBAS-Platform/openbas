import { FunctionComponent, useState } from 'react';

import { deleteAgent } from '../../../../../actions/assets/agent-actions';
import ButtonPopover from '../../../../../components/common/ButtonPopover';
import DialogDelete from '../../../../../components/common/DialogDelete';
import { useFormatter } from '../../../../../components/i18n';
import { AgentOutput } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';

type AgentActionType = 'Update' | 'Delete';

interface Props {
  agent: AgentOutput;
  actions: AgentActionType[];
  onDelete?: (result: string) => void;
  inList?: boolean;
}

const AgentPopover: FunctionComponent<Props> = ({
  agent,
  actions = [],
  onDelete,
  inList = false,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  // Deletion
  const [deletion, setDeletion] = useState(false);
  const handleOpenDelete = () => setDeletion(true);
  const handleCloseDelete = () => setDeletion(false);
  const submitDelete = () => {
    dispatch(deleteAgent(agent.agent_id)).then(
      () => {
        if (onDelete) {
          onDelete(agent.agent_id);
        }
      },
    );
    handleCloseDelete();
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
          text={`${t('Do you want to delete this agent:')} ${agent.agent_executed_by_user} ?`}
        />
      )}
    </>
  );
};

export default AgentPopover;
