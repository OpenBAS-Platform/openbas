import { type FunctionComponent, useState } from 'react';

import { deleteTagRule } from '../../../../actions/tag_rules/tagrule-actions';
import ButtonPopover, { type PopoverEntry } from '../../../../components/common/ButtonPopover';
import DialogDelete from '../../../../components/common/DialogDelete';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import { type TagRuleOutput } from '../../../../utils/api-types';
import CveForm from './CveForm';

interface Props {
  onDelete?: (result: string) => void;
  onUpdate?: (result: TagRuleOutput) => void;
  cve: CveOutput;
}

const CvePopover: FunctionComponent<Props> = ({
  onDelete, onUpdate,
  cve,
}) => {
  const { t } = useFormatter();

  // Edition
  const [openEdit, setOpenEdit] = useState(false);
  const handleOpenEdit = () => setOpenEdit(true);
  const handleCloseEdit = () => setOpenEdit(false);

  // Deletion
  const [openDelete, setOpenDelete] = useState(false);
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);
  const submitDelete = () => {
    deleteTagRule(tagRule.tag_rule_id);
    if (onDelete) {
      onDelete(tagRule.tag_rule_id);
    }
    handleCloseDelete();
  };

  const entries: PopoverEntry[] = [
    {
      label: 'Update',
      action: handleOpenEdit,
    },{
      label: 'Delete',
      action: handleOpenDelete,
    },
  ];

  return (
    <>
      <ButtonPopover entries={entries} variant="icon" />

      <Drawer
        open={openEdit}
        handleClose={handleCloseEdit}
        title={t('Update the asset rule')}
      >
        <CveForm
          cve={cve}
          onUpdate={onUpdate}
          handleClose={handleCloseEdit}
        />
      </Drawer>
    </>
  );
};

export default CvePopover;
