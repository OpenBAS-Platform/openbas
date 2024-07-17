import React, { FunctionComponent, useState } from 'react';
import { PopoverEntry } from '../../../../components/common/ButtonPopover';
import IconPopover from '../../../../components/common/IconPopover';
import type { RawPaginationImportMapper } from '../../../../utils/api-types';
import { deleteXlsMapper } from '../../../../actions/xls_formatter/xls-formatter-actions';
import DialogDelete from '../../../../components/common/DialogDelete';
import { useFormatter } from '../../../../components/i18n';

interface Props {
  mapper: RawPaginationImportMapper;
  onUpdate?: (result: RawPaginationImportMapper) => void;
  onDelete?: (result: string) => void;
}

const XlsMapperPopover: FunctionComponent<Props> = ({
  mapper,
  onUpdate: _onUpdate,
  onDelete,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  // Deletion
  const [openDelete, setOpenDelete] = useState(false);

  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);
  const submitDelete = () => {
    deleteXlsMapper(mapper.import_mapper_id);
    if (onDelete) {
      onDelete(mapper.import_mapper_id);
    }
    handleCloseDelete();
  };

  const entries: PopoverEntry[] = [
    { label: 'Update', action: () => {} }, // FIXME
    { label: 'Delete', action: handleOpenDelete },
  ];

  return (
    <>
      <IconPopover entries={entries} />
      <DialogDelete
        open={openDelete}
        handleClose={handleCloseDelete}
        handleSubmit={submitDelete}
        text={t('Do you want to delete this XLS mapper ?')}
      />
    </>
  );
};

export default XlsMapperPopover;
