import React, { useState } from 'react';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, MenuItem, MenuList, ListItemIcon, ListItemText, InputBaseComponentProps } from '@mui/material';
import { useFormatter } from '../../../../../components/i18n';
import { zodImplement } from '../../../../../utils/Zod';
import type { FilterGroup, InjectImporterAddInput, SearchPaginationInput } from '../../../../../utils/api-types';
import type { InjectorContractStore } from '../../../../../actions/injector_contracts/InjectorContract';
import PaginationComponent from '../../../../../components/common/pagination/PaginationComponent';
import { fetchInjectorsContracts, searchInjectorContracts } from '../../../../../actions/InjectorContracts';
import { initSorting } from '../../../../../components/common/pagination/Page';
import InjectContractComponent from '../../../../../components/InjectContractComponent';
import InjectIcon from '../../../common/injects/InjectIcon';
import { useHelper } from '../../../../../store';
import type { InjectorHelper } from '../../../../../actions/injectors/injector-helper';
import { InjectorContractHelper } from '../../../../../actions/injector_contracts/injector-contract-helper';
import { useAppDispatch } from '../../../../../utils/hooks';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { fetchKillChainPhases } from '../../../../../actions/KillChainPhase';
import { fetchAttackPatterns } from '../../../../../actions/AttackPattern';
import { isNotEmptyField } from '../../../../../utils/utils';

interface Props {
  initialValues?: InjectImporterAddInput;
  inputProps?: InputBaseComponentProps;
  // onDelete: () => void;
}

const importFilter: FilterGroup = {
  mode: 'and',
  filters: [
    {
      key: 'injector_contract_import_available',
      operator: 'eq',
      mode: 'and',
      values: ['true'],
    }],
};

const InjectImporterForm: React.FC<Props> = ({
  initialValues = {
    inject_importer_injector_contract_id: '',
    inject_importer_name: '',
    inject_importer_type_value: '',
    inject_importer_rule_attributes: [],
  },
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  useDataLoader(() => {
    dispatch(fetchInjectorsContracts());
  });

  // Contracts
  const [contracts, setContracts] = useState<InjectorContractStore[]>([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>({
    sorts: initSorting('injector_contract_labels'),
    filterGroup: importFilter,
  });

  // Fetching data
  /* const injectorContractsMap = useHelper((helper: InjectorContractHelper) => ({
     injectorContractsMap: helper.getInjectorContractsMap(),
   })); */

  const {
    register,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<InjectImporterAddInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<InjectImporterAddInput>().with({
        inject_importer_name: z.string().min(1, { message: t('Should not be empty') }),
        inject_importer_type_value: z.string().min(1, { message: t('Should not be empty') }),
        inject_importer_injector_contract_id: z.string().min(1, { message: t('Should not be empty') }),
        inject_importer_rule_attributes: z.any().array().optional(),
      }),
    ),
    defaultValues: initialValues,
  });

  return (
    <>
      {/* <PaginationComponent
        disablePagination
        fetch={searchInjectorContracts}
        searchPaginationInput={searchPaginationInput}
        setContent={setContracts}
        searchEnable={false}
      /> */}
      <form id="injectImporterForm">
        <TextField
          variant="standard"
          fullWidth
          label={t('Inject importer name')}
          style={{ marginTop: 10 }}
          error={!!errors.inject_importer_name}
          helperText={errors.inject_importer_name?.message}
          inputProps={register('inject_importer_name')}
          InputLabelProps={{ required: true }}
        />

        <TextField
          variant="standard"
          fullWidth
          label={t('Inject importer type')}
          style={{ marginTop: 10 }}
          error={!!errors.inject_importer_type_value}
          helperText={errors.inject_importer_type_value?.message}
          inputProps={register('inject_importer_type_value')}
          InputLabelProps={{ required: true }}
        />

        <InjectContractComponent
          fetch={searchInjectorContracts}
          searchPaginationInput={searchPaginationInput}
          setContent={setContracts}
          label={'Inject importer injector contract'}
          injectorContracts={contracts}
          inputProps={register('inject_importer_injector_contract_id')}
        />

        {/* <Controller
          control={control}
          name="inject_importer_injector_contract_id"
          render={({ field }) => (
            <TextField
              select
              variant="standard"
              fullWidth
              label={t('Inject importer injector contract')}
              style={{ marginTop: 10 }}
              value={field.value}
              error={!!errors.inject_importer_injector_contract_id}
              helperText={errors.inject_importer_injector_contract_id?.message}
              inputProps={register('inject_importer_injector_contract_id')}
              InputLabelProps={{ required: true }}
            >
              {contracts.map((contract) => {
                return (
                  <MenuList
                    key={contract.injector_contract_id}
                  >
                    <MenuItem value={contract.injector_contract_id}>
                      <ListItemIcon>
                        <InjectIcon
                          type={
                            contract.injector_contract_payload
                              ? contract.injector_contract_payload?.payload_collector_type
                              || contract.injector_contract_payload?.payload_type
                              : contract.injector_contract_injector_type
                          }
                          isPayload={isNotEmptyField(contract.injector_contract_payload)}
                        />
                      </ListItemIcon>
                      <ListItemText>
                        {tPick(contract.injector_contract_labels)}
                      </ListItemText>
                    </MenuItem>
                  </MenuList>
                );
              })}
            </TextField>
          )}
        /> */}

        <TextField
          variant="standard"
          fullWidth
          label={t('Inject importer rules')}
          style={{ marginTop: 10 }}
          error={!!errors.inject_importer_rule_attributes}
          helperText={errors.inject_importer_rule_attributes?.message}
          inputProps={register('inject_importer_rule_attributes')}
        />

      </form>
    </>

  );
};

export default InjectImporterForm;
