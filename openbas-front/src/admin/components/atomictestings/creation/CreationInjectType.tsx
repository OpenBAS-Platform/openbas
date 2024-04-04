import React, { FunctionComponent, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Button, Chip, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useFormatter } from '../../../../components/i18n';
import { searchInjectorContracts } from '../../../../actions/Inject';
import PaginationComponent from '../../../../components/common/pagination/PaginationComponent';
import type { InjectorContractStore } from '../../../../actions/injectorcontract/InjectorContract';
import type { FilterGroup, SearchPaginationInput } from '../../../../utils/api-types';
import { initSorting } from '../../../../components/common/pagination/Page';
import useFiltersState from '../../../../components/common/filter/useFiltersState';
import { emptyFilterGroup, isEmptyFilter } from '../../../../components/common/filter/FilterUtils';
import { useHelper } from '../../../../store';
import type { AttackPatternHelper } from '../../../../actions/attackpattern/attackpattern-helper';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchAttackPatterns } from '../../../../actions/AttackPattern';
import { useAppDispatch } from '../../../../utils/hooks';
import computeAttackPattern from '../../../../utils/injectorcontract/InjectorContractUtils';
import MitreFilter, { MITRE_FILTER_KEY } from '../../components/atomictestings/MitreFilter';
import Dialog from '../../../../components/common/Dialog';

const useStyles = makeStyles(() => ({
  menuContainer: {
    marginLeft: 30,
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

interface Props {

}

const CreationInjectType: FunctionComponent<Props> = () => {
  // Standard hooks
  const classes = useStyles();
  const { t, tPick } = useFormatter();
  const dispatch = useAppDispatch();

  // Fetching data
  const { attackPatternsMap } = useHelper((helper: AttackPatternHelper) => ({
    attackPatternsMap: helper.getAttackPatternsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchAttackPatterns());
  });

  // Filter
  const [openMitreFilter, setOpenMitreFilter] = React.useState(false);

  // Contracts
  const [contracts, setContracts] = useState<InjectorContractStore[]>([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>({
    sorts: initSorting('injector_contract_labels'),
  });

  const [filterGroup, helpers] = useFiltersState(emptyFilterGroup, (f: FilterGroup) => setSearchPaginationInput({
    ...searchPaginationInput,
    filterGroup: f,
  }));

  return (
    <div className={classes.menuContainer}>
      <PaginationComponent
        fetch={searchInjectorContracts}
        searchPaginationInput={searchPaginationInput}
        setContent={setContracts}
      />
      <div className={classes.container} style={{ marginTop: 10 }}>
        <div>
          {!isEmptyFilter(filterGroup, MITRE_FILTER_KEY)
                && <Chip
                  label={`Attack pattern = ${filterGroup.filters?.[0]?.values?.map((id) => attackPatternsMap[id].attack_pattern_name)}`}
                  onDelete={() => helpers.handleClearAllFilters()}
                  component="a"
                   />
            }
        </div>
        <Button
          variant="outlined"
          color="inherit"
          type="submit"
          onClick={() => setOpenMitreFilter(true)}
        >
          {t('Mitre Filter')}
        </Button>
      </div>
      <List>
        {contracts.map((contract) => (
          <ListItem key={contract.injector_contract_id} divider>
            <ListItemText
              primary={<div className={classes.container}>
                {tPick(contract.injector_contract_labels)}
                <Typography variant="h3"
                  sx={{ m: 0 }}
                >{computeAttackPattern(contract, attackPatternsMap)}</Typography>
              </div>}
            />
          </ListItem>
        ))}
      </List>
      <Dialog
        open={openMitreFilter}
        handleClose={() => setOpenMitreFilter(false)}
        title={t('ATT&CK Matrix')}
        maxWidth={'xl'}
      >
        <MitreFilter helpers={helpers} onClick={() => setOpenMitreFilter(false)}/>
      </Dialog>
    </div>
  );
};

export default CreationInjectType;
