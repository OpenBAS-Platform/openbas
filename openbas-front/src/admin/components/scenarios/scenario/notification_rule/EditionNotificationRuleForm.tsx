import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import DialogDelete from '../../../../../components/common/DialogDelete';
import TextField from '../../../../../components/fields/TextField';
import { useFormatter } from '../../../../../components/i18n';
import type { UpdateNotificationRuleInput } from '../../../../../utils/api-types';
import { zodImplement } from '../../../../../utils/Zod';

interface Props {
  onSubmit: SubmitHandler<UpdateNotificationRuleInput>;
  editionInitialValues: UpdateNotificationRuleInput;
  onDelete: () => void;
}

const EditionNotificationRuleForm: FunctionComponent<Props> = ({
  onSubmit,
  editionInitialValues,
  onDelete,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateNotificationRuleInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<UpdateNotificationRuleInput>().with({ subject: z.string().min(1, { message: t('Should not be empty') }) }),
    ),
    defaultValues: editionInitialValues,
  });

  // Deletion
  const [deletion, setDeletion] = useState(false);
  const handleOpenDelete = () => {
    setDeletion(true);
  };
  const handleCloseDelete = () => setDeletion(false);

  return (

    <>
      <form
        id="notificationRuleForm"
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          gap: theme.spacing(2),
        }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextField
          variant="standard"
          fullWidth
          label={t('Email subject')}
          error={!!errors.subject}
          helperText={errors.subject?.message}
          inputProps={register('subject')}
          InputLabelProps={{ required: true }}
        />

        <TextField
          variant="standard"
          disabled
          fullWidth
          label={t('Trigger on')}
          defaultValue="DIFFERENCE"
        />

        <TextField
          variant="standard"
          disabled
          fullWidth
          label={t('Notifier')}
          defaultValue="EMAIL"
        />
        <div style={{ alignSelf: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleOpenDelete}
            style={{ marginRight: theme.spacing(1) }}
            disabled={isSubmitting}
          >
            {t('Delete')}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            disabled={isSubmitting}
          >
            {t('Update')}
          </Button>
        </div>
      </form>
      <DialogDelete
        open={deletion}
        handleClose={handleCloseDelete}
        handleSubmit={onDelete}
        text={t('Do you want to delete the notification rule?')}
      />
    </>

  );
};

export default EditionNotificationRuleForm;
