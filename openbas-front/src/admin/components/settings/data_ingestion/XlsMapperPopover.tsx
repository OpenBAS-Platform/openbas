import React, { FunctionComponent, useState } from 'react';
import { PopoverEntry } from '../../../../components/common/ButtonPopover';
import IconPopover from '../../../../components/common/IconPopover';
import type { RawPaginationImportMapper } from '../../../../utils/api-types';
import { deleteMapper, exportMapper } from '../../../../actions/mapper/mapper-actions';
import DialogDelete from '../../../../components/common/DialogDelete';
import { useFormatter } from '../../../../components/i18n';
import Drawer from '../../../../components/common/Drawer';
import XlsMapperUpdate from './xls_mapper/XlsMapperUpdate';
import { download } from '../../../../utils/utils';

interface Props {
  mapper: RawPaginationImportMapper;
  onUpdate?: (result: RawPaginationImportMapper) => void;
  onDelete?: (result: string) => void;
  onExport?: (result: string) => void;
}

const XlsMapperPopover: FunctionComponent<Props> = ({
  mapper,
  onUpdate,
  onDelete,
  onExport,
}) => {
  // Standard hooks
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
    deleteMapper(mapper.import_mapper_id);
    if (onDelete) {
      onDelete(mapper.import_mapper_id);
    }
    handleCloseDelete();
  };

  const exportMapperAction = () => {
    exportMapper({
      ids_to_export: [mapper.import_mapper_id],
    }).then(
      (result:{ data: string, filename: string }) => {
        download(JSON.stringify(result.data, null, 2), result.filename, 'application/json');
      },
    );
    if (onExport) {
      onExport(mapper.import_mapper_id);
    }
  };

  const entries: PopoverEntry[] = [
    { label: 'Update', action: handleOpenEdit },
    { label: 'Delete', action: handleOpenDelete },
    { label: 'Export', action: exportMapperAction },
  ];

  return (
    <>
      <IconPopover entries={entries} />
      <Drawer
        open={openEdit}
        handleClose={handleCloseEdit}
        title={t('Update the xls mapper')}
      >
        <XlsMapperUpdate
          xlsMapperId={mapper.import_mapper_id}
          onUpdate={onUpdate}
          handleClose={handleCloseEdit}
        />
      </Drawer>
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
