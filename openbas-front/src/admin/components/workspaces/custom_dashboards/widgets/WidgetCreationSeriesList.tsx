import { AddOutlined } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useState } from 'react';

import { emptyFilterGroup } from '../../../../../components/common/queryable/filter/FilterUtils';
import { useFormatter } from '../../../../../components/i18n';
import { type DateHistogramSeries, type StructuralHistogramSeries } from '../../../../../utils/api-types';
import { type Widget } from '../../../../../utils/api-types-custom';
import WidgetCreationSeries from './WidgetCreationSeries';
import { getCurrentSeriesLimit } from './WidgetUtils';

const WidgetCreationSeriesList: FunctionComponent<{
  widgetType: Widget['widget_type'];
  currentSeries: DateHistogramSeries[] | StructuralHistogramSeries[];
  onChange: (series: DateHistogramSeries[] | StructuralHistogramSeries[]) => void;
  onSubmit: () => void;
}> = ({ widgetType, currentSeries = [], onChange, onSubmit }) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme = useTheme();
  const [error, setError] = useState<boolean>(false);

  const onChangeSeries = (index: number, series: DateHistogramSeries | StructuralHistogramSeries) => {
    const newDatas = currentSeries.map((data, n) => {
      if (n === index) {
        return series;
      }
      return data;
    });
    onChange(newDatas);
  };

  const handleRemoveSeries = (index: number) => {
    const newSeries = Array.from(currentSeries);
    newSeries.splice(index, 1);
    onChange(newSeries);
  };
  const handleAddSeries = () => {
    onChange([
      ...currentSeries,
      {
        name: '',
        filter: emptyFilterGroup,
      },
    ]);
  };

  const handleSubmit = () => {
    const filteredSeries = currentSeries.filter(series => series.filter !== undefined);
    if (filteredSeries.length > 0) {
      onSubmit();
    } else {
      setError(true);
    }
  };

  return (
    <Box marginTop={2}>
      <Box
        display="grid"
        gap={2}
      >
        {currentSeries.map((series, index) => {
          return (
            <WidgetCreationSeries
              key={index}
              index={index}
              series={series}
              onChange={series => onChangeSeries(index, series)}
              onRemove={handleRemoveSeries}
              error={error}
            />
          );
        })}
        <div style={{ display: 'flex' }}>
          <Button
            variant="contained"
            disabled={getCurrentSeriesLimit(widgetType) === currentSeries.length}
            color="secondary"
            onClick={handleAddSeries}
            style={{
              flex: 1,
              height: 20,
            }}
          >
            <AddOutlined fontSize="small" />
          </Button>
        </div>
      </Box>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
      }}
      >
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: theme.spacing(2) }}
          onClick={handleSubmit}
        >
          {t('Validate')}
        </Button>
      </div>
    </Box>
  );
};

export default WidgetCreationSeriesList;
