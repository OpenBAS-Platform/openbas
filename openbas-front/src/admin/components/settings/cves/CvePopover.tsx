import * as R from 'ramda';
import { type FunctionComponent, useEffect, useState } from 'react';

import { deleteCve, fetchCve, updateCve } from '../../../../actions/cve-actions';
import ButtonPopover, { type PopoverEntry } from '../../../../components/common/ButtonPopover';
import DialogDelete from '../../../../components/common/DialogDelete';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import { type CveOutput, type CveSimple, type CveUpdateInput } from '../../../../utils/api-types';
import CveForm from './CveForm';

interface Props {
  onDelete?: (result: string) => void;
  onUpdate?: (result: CveSimple) => void;
  cve: CveSimple;
}

const CvePopover: FunctionComponent<Props> = ({
  onDelete,
  onUpdate,
  cve,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const [fullCve, setFullCve] = useState<CveOutput | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch full CVE
  useEffect(() => {
    if (!cve?.cve_id) return;

    setLoading(true);
    fetchCve(cve.cve_id)
      .then((res) => {
        setFullCve(res.data);
      })
      .catch(() => {
        setFullCve(null); // Optional: set error state if needed
      })
      .finally(() => {
        setLoading(false);
      });
  }, [cve]);

  // Edition
  const [openEdit, setOpenEdit] = useState(false);
  const handleOpenEdit = () => setOpenEdit(true);
  const handleCloseEdit = () => setOpenEdit(false);

  const onSubmitEdit = (data: CveUpdateInput) => {
    return updateCve(cve.cve_id, data).then((result: { data: CveSimple }) => {
      if (onUpdate) {
        onUpdate(result.data);
      }
      handleCloseEdit();
    });
  };

  // Deletion
  const [openDelete, setOpenDelete] = useState(false);
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);
  const submitDelete = () => {
    deleteCve(cve.cve_id);
    if (onDelete) {
      onDelete(cve.cve_id);
    }
    handleCloseDelete();
  };

  // Prevent rendering if data not ready
  if (loading || !fullCve) return <Loader />;

  const initialValues = R.pick([
    'cve_id',
    'cve_cvss',
    'cve_description',
    'cve_source_identifier',
    'cve_published',
    'cve_vuln_status',
    'cve_cisa_action_due',
    'cve_cisa_exploit_add',
    'cve_cisa_required_action',
    'cve_cisa_vulnerability_name',
    'cve_cwes',
    'cve_reference_urls',
    'cve_remediation',
  ], fullCve);

  const entries: PopoverEntry[] = [
    {
      label: 'Update',
      action: handleOpenEdit,
    },
    {
      label: 'Delete',
      action: handleOpenDelete,
    },
  ];

  return (
    <>
      <ButtonPopover entries={entries} variant="icon" />

      <DialogDelete
        open={openDelete}
        handleClose={handleCloseDelete}
        handleSubmit={submitDelete}
        text={`${t('Do you want to delete this CVE:')} ${cve.cve_id} ?`}
      />

      <Drawer
        open={openEdit}
        handleClose={handleCloseEdit}
        title={t('Update the CVE')}
      >
        <CveForm
          editing
          initialValues={initialValues}
          onSubmit={onSubmitEdit}
          handleClose={handleCloseEdit}
        />
      </Drawer>
    </>
  );
};

export default CvePopover;
