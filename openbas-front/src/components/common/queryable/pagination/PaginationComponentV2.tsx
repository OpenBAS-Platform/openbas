import { Box, Button, Chip } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import type { Page } from '../Page';
import type { Filter, PropertySchemaDTO, SearchPaginationInput } from '../../../../utils/api-types';
import { ExportProps } from '../../ExportButton';
import mitreAttack from '../../../../static/images/misc/attack.png';
import Drawer from '../../Drawer';
import MitreFilter, { MITRE_FILTER_KEY } from '../../../../admin/components/common/filters/MitreFilter';
import { useFormatter } from '../../../i18n';
import { availableOperators, isEmptyFilter } from '../filter/FilterUtils';
import type { AttackPatternStore } from '../../../../actions/attack_patterns/AttackPattern';
import { QueryableHelpers } from '../QueryableHelpers';
import TextSearchComponent from '../textSearch/TextSearchComponent';
import TablePaginationComponent from './TablePaginationComponent';
import { OptionPropertySchema } from '../filter/FilterAutocomplete';
import useFilterableProperties from '../filter/useFilterableProperties';
import FilterModeChip from '../filter/FilterModeChip';
import KillChainPhasesFilter from '../../../../admin/components/common/filters/KillChainPhasesFilter';

const useStyles = makeStyles(() => ({
  parameters: {
    marginTop: -10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parametersWithoutPagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

interface Props<T> {
  fetch: (input: SearchPaginationInput) => Promise<{ data: Page<T> }>;
  searchPaginationInput: SearchPaginationInput;
  setContent: (data: T[]) => void;
  exportProps?: ExportProps<T>;
  searchEnable?: boolean;
  disablePagination?: boolean;
  entityPrefix?: string;
  availableFilterNames?: string[];
  queryableHelpers: QueryableHelpers;
  children?: React.ReactElement | null;
  attackPatterns?: AttackPatternStore[],
}

const PaginationComponentV2 = <T extends object>({
  fetch,
  searchPaginationInput,
  setContent,
  exportProps,
  searchEnable = true,
  disablePagination,
  entityPrefix,
  availableFilterNames = [],
  queryableHelpers,
  attackPatterns,
  children,
}: Props<T>) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  const [_properties, setProperties] = useState<PropertySchemaDTO[]>([]);
  const [_options, setOptions] = useState<OptionPropertySchema[]>([]);

  useEffect(() => {
    if (entityPrefix) {
      useFilterableProperties(entityPrefix, availableFilterNames).then((propertySchemas: PropertySchemaDTO[]) => {
        const newOptions = propertySchemas.filter((property) => property.schema_property_name !== MITRE_FILTER_KEY)
          .map((property) => (
            { id: property.schema_property_name, label: t(property.schema_property_name), operator: availableOperators(property)[0] } as OptionPropertySchema
          ));
        setOptions(newOptions);
        setProperties(propertySchemas);
      });
    }
  }, []);

  useEffect(() => {
    // Fetch datas
    fetch(searchPaginationInput).then((result: { data: Page<T> }) => {
      const { data } = result;
      setContent(data.content);
      queryableHelpers.paginationHelpers.handleChangeTotalElements(data.totalElements);
    });
  }, [searchPaginationInput]);

  // Filters
  // const [pristine, setPristine] = useState(true);
  const [openMitreFilter, setOpenMitreFilter] = React.useState(false);

  const computeAttackPatternNameForFilter = () => {
    return searchPaginationInput.filterGroup?.filters?.filter(
      (f: Filter) => f.key === MITRE_FILTER_KEY,
    )?.[0]?.values?.map(
      (externalId: string) => attackPatterns?.find(
        (a: AttackPatternStore) => a.attack_pattern_external_id === externalId,
      )?.attack_pattern_name,
    );
  };

  return (
    <>
      <div className={disablePagination ? classes.parametersWithoutPagination : classes.parameters}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {searchEnable && (
            <TextSearchComponent
              textSearch={searchPaginationInput.textSearch}
              textSearchHelpers={queryableHelpers.textSearchHelpers}
            />
          )}
          {availableFilterNames?.includes(`${entityPrefix}_kill_chain_phases`) && (
            <KillChainPhasesFilter filterKey={`${entityPrefix}_kill_chain_phases`} helpers={queryableHelpers.filterHelpers} />
          )}
          {queryableHelpers.filterHelpers && availableFilterNames?.includes('injector_contract_attack_patterns') && (
            <>
              <div style={{ cursor: 'pointer' }} onClick={() => setOpenMitreFilter(true)}>
                <Button variant="outlined" style={{ marginLeft: searchEnable ? 10 : 0, border: '1px solid #c74227' }}>
                  <img src={mitreAttack} alt="MITRE ATT&CK" style={{ width: 60 }} />
                </Button>
              </div>
              <Drawer
                open={openMitreFilter}
                handleClose={() => setOpenMitreFilter(false)}
                title={t('ATT&CK Matrix')}
                variant="full"
              >
                <MitreFilter helpers={queryableHelpers.filterHelpers} onClick={() => setOpenMitreFilter(false)} />
              </Drawer>
            </>
          )}
        </div>
        {!disablePagination && (
          <TablePaginationComponent
            page={searchPaginationInput.page}
            size={searchPaginationInput.size}
            paginationHelpers={queryableHelpers.paginationHelpers}
            exportProps={exportProps}
          >
            {children}
          </TablePaginationComponent>
        )}
      </div>
      {/* Handle Mitre Filter */}
      {queryableHelpers.filterHelpers && searchPaginationInput.filterGroup && (
        <>
          {!isEmptyFilter(searchPaginationInput.filterGroup, MITRE_FILTER_KEY) && (
            <Box
              sx={{
                padding: '12px 4px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Chip
                style={{ borderRadius: 4 }}
                label={<><strong>{'Attack Pattern'}</strong> = {computeAttackPatternNameForFilter()}</>}
                onDelete={() => queryableHelpers.filterHelpers.handleRemoveFilterByKey(MITRE_FILTER_KEY)}
              />
              {(searchPaginationInput.filterGroup?.filters?.filter((f) => availableFilterNames?.filter((n) => n !== MITRE_FILTER_KEY).includes(f.key)).length ?? 0) > 0 && (
                <FilterModeChip
                  onClick={queryableHelpers.filterHelpers.handleSwitchMode}
                  mode={searchPaginationInput.filterGroup.mode}
                />
              )}
            </Box>
          )}
        </>
      )}
    </>
  );
};

export default PaginationComponentV2;
