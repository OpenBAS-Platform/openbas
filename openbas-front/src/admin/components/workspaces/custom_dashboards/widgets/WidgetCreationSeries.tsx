import { CancelOutlined } from '@mui/icons-material';
import { Box, IconButton, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import { buildFilter } from '../../../../../components/common/queryable/filter/FilterUtils';
import { useFormatter } from '../../../../../components/i18n';
import { type DateHistogramSeries, type StructuralHistogramSeries } from '../../../../../utils/api-types';
import FilterFieldBaseEntity from './FilterFieldBaseEntity';
import { BASE_ENTITY_FILTER_KEY } from './WidgetUtils';

const useStyles = makeStyles()(theme => ({
  step_entity: {
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: 4,
    position: 'relative',
  },
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

const WidgetCreationSeries: FunctionComponent<{
  index: number;
  series: DateHistogramSeries | StructuralHistogramSeries;
  onChange: (series: DateHistogramSeries | StructuralHistogramSeries) => void;
  onRemove: (index: number) => void;
}> = ({ index, series, onChange, onRemove }) => {
  // Standard hooks
  const { classes } = useStyles();
  const { t } = useFormatter();
  const theme = useTheme();

  const [label, setLabel] = useState<string>(series.name ?? '');
  const onChangeLabel = (label: string) => {
    setLabel(label);
    onChange({
      ...series,
      name: label,
    });
  };

  const [entity, setEntity] = useState<string | null>(series.filter?.filters?.find(f => f.key === BASE_ENTITY_FILTER_KEY)?.values?.[0] ?? null);
  const onChangeEntity = (entity: string | null) => {
    setEntity(entity);
    onChange({
      ...series,
      filter: entity === null
        ? undefined
        : {
            mode: 'and',
            filters: [
              buildFilter(BASE_ENTITY_FILTER_KEY, [entity], 'eq'),
            ],
          },
    });
  };

  const handleRemoveSeries = () => {
    onRemove(index);
  };

  return (
    <div className={classes.step_entity}>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 10,
      }}
      >
        <IconButton
          disabled={index === 0}
          aria-label="Delete"
          onClick={handleRemoveSeries}
          size="small"
        >
          <CancelOutlined fontSize="small" />
        </IconButton>
      </div>
      <Box
        padding={theme.spacing(0, 2, 2, 2)}
      >
        <TextField
          variant="standard"
          fullWidth
          label={t('Label (entities)')}
          value={label}
          onChange={e => onChangeLabel(e.target.value)}
        />
        <div style={{ marginTop: theme.spacing(2) }}>
          <FilterFieldBaseEntity value={entity} onChange={onChangeEntity} />
        </div>
      </Box>
    </div>
  );
};

export default WidgetCreationSeries;
