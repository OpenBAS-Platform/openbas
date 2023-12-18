import React, { FunctionComponent } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MuiTextField from '@mui/material/TextField';
import { makeStyles } from '@mui/styles';
import type { InjectExpectationsStore } from '../injects/expectations/Expectation';
import { useFormatter } from '../../../../components/i18n';
import { updateInjectExpectations } from '../../../../actions/Exercise';
import { useAppDispatch } from '../../../../utils/hooks';
import type { ExpectationUpdateInput, Inject } from '../../../../utils/api-types';
import ExpandableText from '../../../../components/common/ExpendableText';
import Drawer from '../../../../components/common/Drawer';
import { Theme } from '../../../../components/Theme';
import Divider from '@mui/material/Divider';
import { Alert } from '@mui/material';
import colorStyles from '../../../../components/Color';
import Chip from '@mui/material/Chip';

const useStyles = makeStyles((theme: Theme) => ({
  mb_20: {
    marginBottom: 20,
  },
  buttons: {
    display: 'flex',
    placeContent: 'end',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2)
  },
  message: {
    width: '100%',
  },
  chipInList: {
    height: 20,
    borderRadius: '0',
    textTransform: 'uppercase',
    width: 200,
    float: 'right'
  },
}));

interface FormProps {
  exerciseId: string;
  expectations: InjectExpectationsStore[];
  onClose: () => void;
}

const DialogExpectationsForm: FunctionComponent<FormProps> = ({
  exerciseId,
  expectations,
  onClose,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const submit = (data: ExpectationUpdateInput[]) => dispatch(
    updateInjectExpectations(exerciseId, data),
  ).then(onClose);

  const onSubmit = (data: { expectations: ExpectationUpdateInput[] }) => {
    const datas = data.expectations.map((e, idx) => ({
      expectation_id: expectations[idx].injectexpectation_id,
      expectation_score: e.expectation_score,
    }));
    submit(datas);
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<{ expectations: ExpectationUpdateInput[] }>({
    mode: 'onTouched',
    resolver: zodResolver(z.object({
      expectations: z.array(z.object({
        expectation_score: z.coerce.number(),
      })),
    })),
    defaultValues: {
      expectations: expectations
        .sort((e1, e2) => (e1.inject_expectation_name ?? '').localeCompare(e2.inject_expectation_name ?? ''))
        .map((expectation) => ({
          expectation_score: expectation.inject_expectation_score || expectation.inject_expectation_expected_score,
        })),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: 'expectations',
  });

  return (
    <form id="expectationForm" onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, index) => {
        const expectation = expectations[index];
        return (
          <div key={field.id}>
            {/*<Grid container={true} spacing={3}>*/}
            {/*  <Grid item={true} xs={8}>*/}
            {/*    <Typography variant="h3">{t('Name')}</Typography>*/}
            {/*    {expectation.inject_expectation_name}*/}
            {/*  </Grid>*/}
            {/*  <Grid item={true} xs={4}>*/}
            {/*    <MuiTextField*/}
            {/*      variant="standard"*/}
            {/*      fullWidth={true}*/}
            {/*      label={t('Score')}*/}
            {/*      type="number"*/}
            {/*      error={!!errors.expectations?.[index]?.expectation_score}*/}
            {/*      helperText={*/}
            {/*        errors.expectations?.[index]?.expectation_score && errors.expectations?.[index]?.expectation_score?.message*/}
            {/*      }*/}
            {/*      inputProps={register(`expectations.${index}.expectation_score`)}*/}
            {/*    />*/}
            {/*  </Grid>*/}
            {/*  {*/}
            {/*    expectation.inject_expectation_description*/}
            {/*    && <Grid item={true} xs={12}>*/}
            {/*      <Typography variant="h3">{t('Description')}</Typography>*/}
            {/*      <ExpandableText source={expectation.inject_expectation_description} limit={120} />*/}
            {/*    </Grid>*/}
            {/*  }*/}
            {/*</Grid>*/}
            <Alert
              classes={{ message: classes.message }}
              severity="info"
              icon={false}
              variant="outlined"
              className={classes.mb_20}
            >
              <Chip
                classes={{ root: classes.chipInList }}
                style={
                  index === 1
                    ? colorStyles.green
                    : colorStyles.orange
                }
                label={t(index === 0 ? 'Pending validation' : 'Validated')}
              />
              <Typography variant="h3">{t('Name')}</Typography>
              {expectation.inject_expectation_name}
              {expectation.inject_expectation_description
                && <div style={{ marginTop: 20 }}>
                  <Typography variant="h3">{t('Description')}</Typography>
                  <ExpandableText source={expectation.inject_expectation_description} limit={120} />
                </div>
              }
              <MuiTextField
                style={{ marginTop: 20 }}
                variant="standard"
                fullWidth
                label={t('Score')}
                type="number"
                error={!!errors.expectations?.[index]?.expectation_score}
                helperText={
                  errors.expectations?.[index]?.expectation_score && errors.expectations?.[index]?.expectation_score?.message
                }
                inputProps={register(`expectations.${index}.expectation_score`)}
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                style={{ float: 'right', marginTop: 20}}
              >
                {t('Validate')}
              </Button>
            </Alert>
          </div>
        );
      })}
      <div className={classes.buttons}>
        <Button
          variant="contained"
          onClick={onClose}
          disabled={isSubmitting}
        >
          {t('Close')}
        </Button>
      </div>
    </form>
  );
};

interface Props {
  exerciseId: string;
  inject: Inject;
  expectations: InjectExpectationsStore[] | null;
  open: boolean;
  onClose: () => void;
}

const ManualExpectationsValidation: FunctionComponent<Props> = ({
  exerciseId,
  inject,
  expectations,
  open,
  onClose,
}) => {
  const { t, fndt } = useFormatter();

  return (
    <Drawer
      open={open}
      handleClose={onClose}
      // title={inject.inject_title ?? t('Inject')}
      title={t('Expectations of ') + inject.inject_title}
    >
      <>
        {/*<Grid container={true} spacing={3}>*/}
        {/*  <Grid item={true} xs={6}>*/}
        {/*    <Typography variant="h3">{t('Title')}</Typography>*/}
        {/*    {inject.inject_title}*/}
        {/*  </Grid>*/}
        {/*  <Grid item={true} xs={6}>*/}
        {/*    <Typography variant="h3">{t('Description')}</Typography>*/}
        {/*    {inject.inject_description}*/}
        {/*  </Grid>*/}
        {/*  <Grid item={true} xs={6}>*/}
        {/*    <Typography variant="h3">{t('Sent at')}</Typography>*/}
        {/*    {fndt(inject.inject_sent_at)}*/}
        {/*  </Grid>*/}
        {/*  <Grid item={true} xs={6}>*/}
        {/*    <Typography variant="h3">{t('Tags')}</Typography>*/}
        {/*    <ItemTags tags={inject.inject_tags || []} />*/}
        {/*  </Grid>*/}
        {/*</Grid>*/}
        {/*<Typography variant="h2" style={{ marginTop: 30 }}>*/}
        {/*  {t('Expectations')}*/}
        {/*</Typography>*/}
        {expectations
          && <DialogExpectationsForm exerciseId={exerciseId} expectations={expectations} onClose={onClose} />
        }
      </>
    </Drawer>
  );
};
export default ManualExpectationsValidation;
