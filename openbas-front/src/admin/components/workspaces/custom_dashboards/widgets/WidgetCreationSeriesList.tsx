import { AddOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';
import { type FunctionComponent } from 'react';

import { emptyFilterGroup } from '../../../../../components/common/queryable/filter/FilterUtils';
import { useFormatter } from '../../../../../components/i18n';
import { type DateHistogramSeries, type StructuralHistogramSeries, type Widget } from '../../../../../utils/api-types';
import WidgetCreationSeries from './WidgetCreationSeries';
import { getCurrentSeriesLimit } from './WidgetUtils';

const WidgetCreationSeriesList: FunctionComponent<{
  widgetType: Widget['widget_type'];
  value: DateHistogramSeries[] | StructuralHistogramSeries[];
  onChange: (series: DateHistogramSeries[] | StructuralHistogramSeries[]) => void;
  onSubmit: () => void;
}> = ({ widgetType, value = [], onChange, onSubmit }) => {
  // Standard hooks
  const { t } = useFormatter();

  const onChangeSeries = (index: number, series: DateHistogramSeries | StructuralHistogramSeries) => {
    const newDatas = value.map((data, n) => {
      if (n === index) {
        return series;
      }
      return data;
    });
    onChange(newDatas);
  };

  const handleRemoveSeries = (index: number) => {
    const newSeries = Array.from(value);
    newSeries.splice(index, 1);
    onChange(newSeries);
  };
  const handleAddSeries = () => {
    onChange([
      ...value,
      {
        name: '',
        filter: emptyFilterGroup,
      },
    ]);
  };

  return (
    <div style={{ marginTop: 20 }}>
      {value.map((series, index) => {
        return (
          <WidgetCreationSeries
            key={index}
            index={index}
            series={series}
            onChange={series => onChangeSeries(index, series)}
            onRemove={handleRemoveSeries}
          />
        );
      })}
      <div style={{ display: 'flex' }}>
        <Button
          variant="contained"
          disabled={getCurrentSeriesLimit(widgetType) === value.length}
          color="secondary"
          size="small"
          onClick={handleAddSeries}
          style={{
            width: '100%',
            height: 20,
            flex: 1,
          }}
        >
          <AddOutlined fontSize="small" />
        </Button>
      </div>
      <div style={{
        marginTop: 20,
        textAlign: 'center',
      }}
      >
        <Button
          variant="contained"
          color="primary"
          style={{
            marginTop: 20,
            textAlign: 'center',
          }}
          onClick={onSubmit}
        >
          {t('Validate')}
        </Button>
      </div>
    </div>
  );
};

export default WidgetCreationSeriesList;
