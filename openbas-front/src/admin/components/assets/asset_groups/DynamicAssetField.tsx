import { InputLabel, Tooltip } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import React, { FunctionComponent } from 'react';
import FilterField from '../../../../components/common/queryable/filter/FilterField';
import useFiltersState from '../../../../components/common/queryable/filter/useFiltersState';
import { emptyFilterGroup } from '../../../../components/common/queryable/filter/FilterUtils';
import type { FilterGroup } from '../../../../utils/api-types';
import { useFormatter } from '../../../../components/i18n';

interface Props {
  value?: FilterGroup;
  onChange?: (value: FilterGroup) => void;
}

const DynamicAssetField: FunctionComponent<Props> = ({
  value,
  onChange,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const [filterGroup, helpers] = useFiltersState(value ?? emptyFilterGroup, onChange);

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'end', gap: 10 }}>
        <InputLabel id="dynamic-asset-filter">{t('Dynamic asset filter')}</InputLabel>
        <Tooltip title={t('Filter allowing assets to be added dynamically to this group')}>
          <InfoOutlined
            fontSize="small"
            color="primary"
            style={{ marginTop: 8 }}
          />
        </Tooltip>
      </div>
      <FilterField
        clazz="Endpoint"
        filterGroup={filterGroup}
        helpers={helpers}
        style={{ marginTop: 20 }}
      />
    </div>
  );
};

export default DynamicAssetField;
