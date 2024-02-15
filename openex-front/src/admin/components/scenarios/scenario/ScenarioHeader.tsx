import { useParams } from 'react-router-dom';
import React, { useState } from 'react';
import { Button, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import type { ScenariosHelper } from '../../../../actions/scenarios/scenario-helper';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchScenario, updateScenarioTags } from '../../../../actions/scenarios/scenario-actions';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import ScenarioPopover from './ScenarioPopover';
import * as R from 'ramda';
import { AddOutlined } from '@mui/icons-material';
import Transition from '../../../../components/common/Transition';
import { Form } from 'react-final-form';
import TagField from '../../../../components/TagField';
import TagChip from '../../components/tags/TagChip';
import useScenarioPermissions from '../../../../utils/Scenario';
import { useFormatter } from '../../../../components/i18n';
import { Option } from '../../../../utils/Option';
import { Theme } from '../../../../components/Theme';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  containerTitle: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  title: {
    textTransform: 'uppercase',
    marginBottom: 0,
  },
}));

const Tags = ({ scenario }: { scenario: ScenarioStore }) => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const { t } = useFormatter();

  const { scenario_tags: tags } = scenario;

  const [openTagAdd, setOpenTagAdd] = useState(false);
  const handleToggleAddTag = () => setOpenTagAdd(!openTagAdd);
  const permissions = useScenarioPermissions(scenario.scenario_id);

  const deleteTag = (tagId: string) => {
    const tagIds = scenario.scenario_tags?.filter((id) => id !== tagId);
    dispatch(
      updateScenarioTags(scenario.scenario_id, {
        scenario_tags: tagIds,
      }),
    );
  };
  const submitTags = (values: {scenario_tags : Option[]}) => {
    handleToggleAddTag();
    dispatch(
      updateScenarioTags(scenario.scenario_id, {
        scenario_tags: R.uniq([
          ...values.scenario_tags.map((tag) => tag.id),
          ...(scenario.scenario_tags ?? []),
        ]),
      }),
    );
  };

  return (
    <div>
      <IconButton
        color="primary"
        aria-label="Tag"
        onClick={handleToggleAddTag}
        disabled={permissions.readOnly}
      >
        <AddOutlined />
      </IconButton>
      <Dialog
        TransitionComponent={Transition}
        open={openTagAdd}
        onClose={handleToggleAddTag}
        fullWidth
        maxWidth="xs"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Add tags to this scenario')}</DialogTitle>
        <DialogContent>
          <Form
            keepDirtyOnReinitialize
            initialValues={{ scenario_tags: [] }}
            onSubmit={submitTags}
            mutators={{
              setValue: ([field, value], state, { changeValue }) => {
                changeValue(state, field, () => value);
              },
            }}
          >
            {({ handleSubmit, form, values, submitting, pristine }) => (
              <form id="tagsForm" onSubmit={handleSubmit}>
                <TagField
                  name="scenario_tags"
                  label={null}
                  values={values}
                  setFieldValue={form.mutators.setValue}
                  placeholder={t('Tags')}
                />
                <div style={{ float: 'right', marginTop: 20 }}>
                  <Button
                    onClick={handleToggleAddTag}
                    style={{ marginRight: 10 }}
                    disabled={submitting}
                  >
                    {t('Cancel')}
                  </Button>
                  <Button
                    color="secondary"
                    type="submit"
                    disabled={pristine || submitting}
                  >
                    {t('Add')}
                  </Button>
                </div>
              </form>
            )}
          </Form>
        </DialogContent>
      </Dialog>
      {R.take(5, tags ?? []).map((tag: string) => (
        <TagChip
          key={tag}
          tagId={tag}
          isReadOnly={permissions.readOnly}
          deleteTag={deleteTag}
        />
      ))}
    </div>
  );
};

const ScenarioHeader = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };

  // Fetching data
  const { scenario }: { scenario: ScenarioStore } = useHelper((helper: ScenariosHelper) => ({
    scenario: helper.getScenario(scenarioId),
  }));
  useDataLoader(() => {
    dispatch(fetchScenario(scenarioId));
  });
  return (
    <div className={classes.container}>
      <div className={classes.containerTitle}>
        <Typography
          variant="h1"
          gutterBottom
          classes={{ root: classes.title }}
        >
          {scenario.scenario_name}
        </Typography>
        <ScenarioPopover scenario={scenario} />
      </div>
      <Tags scenario={scenario} />
    </div>
  );
};

export default ScenarioHeader;
