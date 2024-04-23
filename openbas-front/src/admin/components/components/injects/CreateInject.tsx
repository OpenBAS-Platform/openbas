import React, { FunctionComponent, useContext, useState } from 'react';
import * as R from 'ramda';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import InjectForm from './InjectForm';
import { useFormatter } from '../../../../components/i18n';
import type { Contract } from '../../../../actions/contract/contract';
import Transition from '../../../../components/common/Transition';
import { InjectContext } from '../Context';
import type { InjectInput } from '../../../../actions/injects/Inject';
import ButtonCreate from '../../../../components/common/ButtonCreate';

interface Props {
  injectorContractsMap: Record<string, Contract>;
  onCreate: (injectId: string) => void;
}

const CreateInject: FunctionComponent<Props> = ({
  injectorContractsMap,
  onCreate,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const [open, setOpen] = useState(false);
  const { onAddInject } = useContext(InjectContext);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const onSubmit = async (data: InjectInput) => {
    const inputValues = R.pipe(
      R.assoc(
        'inject_depends_duration',
        data.inject_depends_duration_days * 3600 * 24
        + data.inject_depends_duration_hours * 3600
        + data.inject_depends_duration_minutes * 60
        + data.inject_depends_duration_seconds,
      ),
      R.assoc('inject_type', data.inject_contract.type),
      R.assoc('inject_contract', data.inject_contract.id),
      R.assoc('inject_tags', R.pluck('id', data.inject_tags)),
      R.dissoc('inject_depends_duration_days'),
      R.dissoc('inject_depends_duration_hours'),
      R.dissoc('inject_depends_duration_minutes'),
      R.dissoc('inject_depends_duration_seconds'),
    )(data);
    const result = await onAddInject(inputValues);
    if (result.result) {
      if (onCreate) {
        handleClose();
        return onCreate(result.result);
      }
      return handleClose();
    }
    return result;
  };

  return (
    <div>
      <ButtonCreate onClick={handleOpen} />
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Create a new inject')}</DialogTitle>
        <DialogContent>
          <InjectForm
            editing={false}
            onSubmit={onSubmit}
            initialValues={{
              inject_tags: [],
              inject_depends_duration_days: 0,
              inject_depends_duration_hours: 0,
              inject_depends_duration_minutes: 0,
              inject_depends_duration_seconds: 0,
            }}
            handleClose={handleClose}
            injectorContractsMap={injectorContractsMap}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateInject;
