import React, { useEffect, useState } from 'react';
import { TextField, Autocomplete, Box, SelectChangeEvent, InputBaseComponentProps } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FieldError, FieldErrors } from 'react-hook-form';
import type { SearchPaginationInput } from '../utils/api-types';
import type { Page } from './common/pagination/Page';
import { useFormatter } from './i18n';
import InjectIcon from '../admin/components/common/injects/InjectIcon';
import type { InjectorContractStore } from '../actions/injector_contracts/InjectorContract';
import { isNotEmptyField } from '../utils/utils';
import { useAppDispatch } from '../utils/hooks';
import { useHelper } from '../store';
import type { InjectorHelper } from '../actions/injectors/injector-helper';
import useDataLoader from '../utils/hooks/useDataLoader';
import { fetchInjectors } from '../actions/Injectors';

const useStyles = makeStyles(() => ({
  icon: {
    paddingTop: 4,
    display: 'inline-block',
  },
  text: {
    display: 'inline-block',
    flexGrow: 1,
    marginLeft: 10,
  },
}));

interface Props<T> {
  fetch: (input: SearchPaginationInput) => Promise<{ data: Page<T> }>;
  searchPaginationInput: SearchPaginationInput;
  setContent: (data: T[]) => void;
  label: string;
  injectorContracts: InjectorContractStore[];
  onChange: (data: string | null | undefined) => void;
  error: FieldError | undefined;
  fieldValue: string | undefined;
}

const InjectContractComponent = <T extends object>({
  fetch,
  searchPaginationInput,
  setContent,
  label,
  injectorContracts,
  onChange,
  error,
  fieldValue,
}: Props<T>) => {
  // Standard hooks
  const classes = useStyles();
  const { t, tPick } = useFormatter();
  const dispatch = useAppDispatch();

  // Fetching data
  const { injectorMap } = useHelper((helper: InjectorHelper) => ({
    injectorMap: helper.getInjectorsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchInjectors());
  });

  // Pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(100);
  const [totalElements, setTotalElements] = useState(0);

  // Text Search
  const [textSearch, setTextSearch] = React.useState(searchPaginationInput.textSearch ?? '');

  const searchContract = (event: React.SyntheticEvent) => {
    const selectChangeEvent = event as SelectChangeEvent;
    const val = selectChangeEvent?.target.value ?? '';
    return injectorContracts.filter(
      (type) => type.injector_contract_id.includes(val)
        || tPick(type.injector_contract_labels).includes(val),
    );
  };

  useEffect(() => {
    const finalSearchPaginationInput = {
      ...searchPaginationInput,
      textSearch,
      page,
      size: rowsPerPage,
    };

    fetch(finalSearchPaginationInput).then((result: { data: Page<T> }) => {
      const { data } = result;
      setContent(data.content);
      setTotalElements(data.totalElements);
    });
  }, [searchPaginationInput, page, rowsPerPage, textSearch]);

  const [value, setValue] = React.useState<string | null | undefined>(fieldValue ?? '');

  return (
    <Autocomplete
      selectOnFocus
      openOnFocus
      autoHighlight
      noOptionsText={t('No available options')}
      getOptionLabel={(option) => tPick(option.injector_contract_labels)}
      renderInput={
        (params) => (
          <TextField
            {...params}
            label={t(label)}
            style={{ marginTop: 20 }}
            variant="outlined"
            size="small"
            InputLabelProps={{ required: true }}
            error={!!error}
            helperText={error?.message}
          />
        )
      }
      options={injectorContracts}
      value={injectorContracts.find((i) => i.injector_contract_id === value) || null}
      onChange={(event, injectorContract) => {
        setValue(injectorContract?.injector_contract_id);
        onChange(injectorContract?.injector_contract_id);
      }}
      onInputChange={(event) => searchContract(event)}
      renderOption={(props, option) => (
        <li {...props}>
          <div className={classes.icon}>
            <InjectIcon
              type={
                option.injector_contract_payload
                  ? option.injector_contract_payload?.payload_collector_type
                  || option.injector_contract_payload?.payload_type
                  : injectorMap[option.injector_contract_injector]?.injector_type
              }
              isPayload={isNotEmptyField(option.injector_contract_payload)}
            />
          </div>
          <div className={classes.text}>
            {tPick(option.injector_contract_labels)}
          </div>
        </li>
      )}
    />
  );
};

export default InjectContractComponent;
