import React, { FunctionComponent, useState } from 'react';
import ButtonCreate from '../../../components/common/ButtonCreate';
import { useFormatter } from '../../../components/i18n';
import { useAppDispatch } from '../../../utils/hooks';
import { addScenario } from '../../../actions/scenarios/scenario-actions';
import Drawer from '../../../components/common/Drawer';
import ScenarioForm from './ScenarioForm';
import { ScenarioCreateInput } from '../../../utils/api-types';


interface Props {

}

const ScenarioCreation: FunctionComponent<Props> = ({}) => {
  // Standard hooks
  const [open, setOpen] = useState(false);
  const { t } = useFormatter();

  const dispatch = useAppDispatch();
  const onSubmit = (data: ScenarioCreateInput) => {
    dispatch(addScenario(data));
    setOpen(false);
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
