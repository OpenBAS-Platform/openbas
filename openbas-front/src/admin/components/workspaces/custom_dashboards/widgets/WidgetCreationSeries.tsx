import { CancelOutlined } from '@mui/icons-material';
import { IconButton, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import { buildFilter } from '../../../../../components/common/queryable/filter/FilterUtils';
import { useFormatter } from '../../../../../components/i18n';
import { type DateHistogramSeries, type StructuralHistogramSeries } from '../../../../../utils/api-types';
import FilterFieldBaseEntity from './FilterFieldBaseEntity';

const useStyles = makeStyles()(theme => ({
  step_entity: {
    position: 'relative',
    width: '100%',
    margin: '0 0 20px 0',
    padding: 15,
    verticalAlign: 'middle',
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: 4,
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

  const [entity, setEntity] = useState<string | null>(null);
  const onChangeEntity = (entity: string | null) => {
    setEntity(entity);
    onChange({
      ...series,
      filter: entity === null
        ? undefined
        : {
            mode: 'and',
            filters: [
              buildFilter('base_entity', [entity], 'eq'),
            ],
          },
    });
  };

  const handleRemoveSeries = () => {
    onRemove(index);
  };

  return (
    <div className={classes.step_entity}>
      <IconButton
        disabled={index === 0}
        aria-label="Delete"
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
        }}
        onClick={handleRemoveSeries}
        size="large"
      >
        <CancelOutlined fontSize="small" />
      </IconButton>
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
    </div>
  );
};

export default WidgetCreationSeries;
