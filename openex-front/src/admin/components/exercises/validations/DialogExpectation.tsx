import React, { FunctionComponent } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ItemTags from '../../../../components/ItemTags.js';
import { Form } from 'react-final-form';
import { TextField } from '../../../../components/TextField.js';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Transition from '../../../../components/common/Transition.tsx';
import { InjectExpectationsStore } from '../injects/expectations/Expectation';
import { useFormatter } from '../../../../components/i18n.js';
import { updateInjectExpectation } from '../../../../actions/Exercise.js';
import { useAppDispatch } from '../../../../utils/hooks.ts';

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
  const dispatch = useAppDispatch();

  const validate = (values) => {
    const errors = {};
    const requiredFields = ['expectation_score'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  };
  const onSubmit = (injectExpectationId: string, data: InjectExpectationsStore) => dispatch(
    updateInjectExpectation(exerciseId, injectExpectationId, data),
  ).then(onClose);

  if (!expectation) {
    return (<></>);
  }

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
        {expectation.inject_expectation_inject?.inject_title}
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
        <Form
          keepDirtyOnReinitialize={true}
          initialValues={{
            expectation_score:
            expectation?.inject_expectation_expected_score,
          }}
          onSubmit={(data) => onSubmit(expectation?.injectexpectation_id, data)}
          validate={validate}
          mutators={{
            setValue: ([field, value], state, { changeValue }) => {
              changeValue(state, field, () => value);
            },
          }}
        >
          {({ handleSubmit, submitting, errors }) => (
            <form id="challengeForm" onSubmit={handleSubmit}>
              <TextField
                variant="standard"
                type="number"
                name="expectation_score"
                fullWidth={true}
                label={t('Score')}
              />
              <div style={{ float: 'right', marginTop: 20 }}>
                <Button
                  onClick={onClose}
                  style={{ marginRight: 10 }}
                  disabled={submitting}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  color="secondary"
                  type="submit"
                  disabled={submitting || Object.keys(errors).length > 0}
                >
                  {t('Validate')}
                </Button>
              </div>
            </form>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
};
export default DialogExpectation;
