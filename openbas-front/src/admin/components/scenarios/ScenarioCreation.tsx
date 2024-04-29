import React, { FunctionComponent, useState } from 'react';
import ButtonCreate from '../../../components/common/ButtonCreate';
import { useFormatter } from '../../../components/i18n';
import { useAppDispatch } from '../../../utils/hooks';
import { addScenario } from '../../../actions/scenarios/scenario-actions';
import Drawer from '../../../components/common/Drawer';
import ScenarioForm from './ScenarioForm';
import type { ScenarioInput } from '../../../utils/api-types';
import type { ScenarioStore } from '../../../actions/scenarios/Scenario';

interface Props {
  onCreate?: (result: ScenarioStore) => void;
}

const ScenarioCreation: FunctionComponent<Props> = ({
  onCreate,
}) => {
  // Standard hooks
  const [open, setOpen] = useState(false);
  const { t } = useFormatter();

  const dispatch = useAppDispatch();
  const onSubmit = (data: ScenarioInput) => {
    dispatch(addScenario(data)).then(
      (result: { result: string, entities: { scenarios: Record<string, ScenarioStore> } }) => {
        if (result.entities) {
          if (onCreate) {
            const created = result.entities.scenarios[result.result];
            onCreate(created);
          }
          setOpen(false);
        }
        return result;
      },
    );
  };

  return (
    <>
      <ButtonCreate onClick={() => setOpen(true)} />
      <Drawer
        open={open}
        handleClose={() => setOpen(false)}
        title={t('Create a new scenario')}
      >
        <ScenarioForm
          onSubmit={onSubmit}
          handleClose={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
};
export default ScenarioCreation;
