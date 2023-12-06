import React, { FunctionComponent } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ItemTags from '../../../../components/ItemTags.js';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Transition from '../../../../components/common/Transition.tsx';
import { InjectExpectationsStore } from '../injects/expectations/Expectation';
import { useFormatter } from '../../../../components/i18n.js';
import { updateInjectExpectation } from '../../../../actions/Exercise.js';
import { useAppDispatch } from '../../../../utils/hooks.ts';
import { useForm } from 'react-hook-form';
import { ExpectationUpdateInput } from '../../../../utils/api-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { zodImplement } from '../../../../utils/Zod.ts';
import { z } from 'zod';
import MuiTextField from '@mui/material/TextField';

interface FormProps {
  exerciseId: string;
  expectation: InjectExpectationsStore;
  onClose: () => void;
}

const DialogExpectationForm: FunctionComponent<FormProps> = ({
  exerciseId,
  expectation,
  onClose,
}) => {
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const submit = (data: ExpectationUpdateInput) => dispatch(
    updateInjectExpectation(exerciseId, expectation.injectexpectation_id, data),
  ).then(onClose);

  const onSubmit = (data: ExpectationUpdateInput) => {
    submit(data);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ExpectationUpdateInput>({
    mode: 'onTouched',
    resolver: zodResolver(zodImplement<ExpectationUpdateInput>().with({
      expectation_score: z.coerce.number(),
    })),
    defaultValues: {
      expectation_score: expectation.inject_expectation_expected_score,
    },
  });

  return (
    <form id="expectationForm" onSubmit={handleSubmit(onSubmit)}>
      <MuiTextField
        variant="standard"
        fullWidth={true}
        label={t('Score')}
        type="number"
        error={!!errors.expectation_score}
        helperText={
          errors.expectation_score && errors.expectation_score?.message
        }
        inputProps={register('expectation_score')}
      />
      <div style={{ float: 'right', marginTop: 20 }}>
        <Button
          onClick={onClose}
          style={{ marginRight: 10 }}
          disabled={isSubmitting}
        >
          {t('Cancel')}
        </Button>
        <Button
          color="secondary"
          type="submit"
          disabled={!isDirty || isSubmitting}
        >
          {t('Validate')}
        </Button>
      </div>
    </form>
  );
};

interface Props {
  exerciseId: string;
  expectation: InjectExpectationsStore | undefined;
  open: boolean;
  onClose: () => void;
}

const DialogExpectation: FunctionComponent<Props> = ({
  exerciseId,
  expectation,
  open,
  onClose,
}) => {
  const { t, fndt } = useFormatter();

  return (
    <Dialog
      TransitionComponent={Transition}
      open={open}
      onClose={onClose}
      fullWidth={true}
      maxWidth="md"
      PaperProps={{ elevation: 1 }}
    >
      <DialogTitle>
        {expectation?.inject_expectation_inject?.inject_title}
      </DialogTitle>
      <DialogContent>
        <Grid container={true} spacing={3}>
          <Grid item={true} xs={6}>
            <Typography variant="h3">{t('Title')}</Typography>
            {expectation?.inject_expectation_inject?.inject_title}
          </Grid>
          <Grid item={true} xs={6}>
            <Typography variant="h3">{t('Description')}</Typography>
            {
              expectation?.inject_expectation_inject
                ?.inject_description
            }
          </Grid>
          <Grid item={true} xs={6}>
            <Typography variant="h3">{t('Sent at')}</Typography>
            {fndt(
              expectation?.inject_expectation_inject?.inject_sent_at,
            )}
          </Grid>
          <Grid item={true} xs={6}>
            <Typography variant="h3">{t('Tags')}</Typography>
            <ItemTags
              tags={
                expectation?.inject_expectation_inject
                  ?.inject_tags || []
              }
            />
          </Grid>
        </Grid>
        <Typography variant="h2" style={{ marginTop: 30 }}>
          {t('Results')}
        </Typography>
        {expectation &&
          <DialogExpectationForm exerciseId={exerciseId} expectation={expectation} onClose={onClose} />
        }
      </DialogContent>
    </Dialog>
  );
};
export default DialogExpectation;
