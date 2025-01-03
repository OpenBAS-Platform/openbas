import { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router';
import { Agent } from '../../../../../utils/api-types';
import { useFormatter } from '../../../../../components/i18n';
import ButtonPopover from '../../../../../components/common/ButtonPopover';
import DialogDelete from '../../../../../components/common/DialogDelete';

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
  const navigate = useNavigate();

  // Edition
  const [edition, setEdition] = useState(false);
  const handleOpenEdit = () => setEdition(true);
  const handleCloseEdit = () => setEdition(false);

  // Deletion
  const [deletion, setDeletion] = useState(false);
  const handleOpenDelete = () => setDeletion(true);
  const handleCloseDelete = () => setDeletion(false);
  const submitDelete = () => {
    /* deleteAgent(agent.agent_id).then(() => {
       handleCloseDelete();
       if (onDelete) onDeleteagent.agent_id;
     });*/
  };

  // Button Popover
  const entries = [];
  if (actions.includes('Update')) entries.push({ label: 'Update', action: () => handleOpenEdit() });
  if (actions.includes('Delete')) entries.push({ label: 'Delete', action: () => handleOpenDelete() });

  return (
    <>
      <ButtonPopover entries={entries} variant={inList ? 'icon' : 'toggle'} />
      {actions.includes(('Update'))
        && (
          <></>
        )}
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
