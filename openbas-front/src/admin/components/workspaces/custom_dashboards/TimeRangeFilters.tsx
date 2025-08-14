import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DateTimePicker } from '@mui/x-date-pickers';
import { type FunctionComponent } from 'react';

import { useFormatter } from '../../../../components/i18n';

interface Props {
  handleTimeRange: (data: string) => void;
  handleStartDate: (data: string) => void;
  handleEndDate: (data: string) => void;
  timeRangeValue: string | undefined;
  startDateValue: string | undefined;
  endDateValue: string | undefined;
}

const TimeRangeFilters: FunctionComponent<Props> = ({ handleTimeRange, handleStartDate, handleEndDate, timeRangeValue, startDateValue, endDateValue }) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme = useTheme();

  const timeRangeItems = [
    {
      value: 'ALL_TIME',
      label: t('All time'),
    },
    {
      value: 'CUSTOM',
      label: t('Custom range'),
    },
    {
      value: 'LAST_DAY',
      label: t('Last 24 hours'),
    },
    {
      value: 'LAST_WEEK',
      label: t('Last 7 days'),
    },
    {
      value: 'LAST_MONTH',
      label: t('Last month'),
    },
    {
      value: 'LAST_QUARTER',
      label: t('Last 3 months'),
    },
    {
      value: 'LAST_SEMESTER',
      label: t('Last 6 months'),
    },
    {
      value: 'LAST_YEAR',
      label: t('Last year'),
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: theme.spacing(2),
    }}
    >
      <FormControl
        size="small"
        sx={{ minWidth: 120 }}
      >
        <InputLabel id="customDashboardTimeRangeSelectLabel" variant="outlined">{t('Time range')}</InputLabel>
        <Select
          labelId="customDashboardTimeRangeSelectLabel"
          label={t('Time range')}
          id="customDashboardTimeRangeSelect"
          variant="outlined"
          value={timeRangeValue}
          onChange={(event: SelectChangeEvent) => {
            handleTimeRange(event.target.value);
          }}
        >
          {timeRangeItems.map(item => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {
        timeRangeValue === 'CUSTOM' && (
          <>
            <DateTimePicker
              views={['year', 'month', 'day']}
              value={startDateValue ? new Date(startDateValue) : null}
              maxDate={new Date(new Date(endDateValue ?? '').setUTCHours(24, 0, 0, 0))}
              onChange={(startDate) => {
                handleStartDate(new Date(new Date(startDate!).setUTCHours(24, 0, 0, 0)).toISOString());
              }}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  size: 'small',
                },
              }}
              label={t('Start date')}
            />
            <DateTimePicker
              views={['year', 'month', 'day']}
              value={endDateValue ? new Date(endDateValue) : null}
              minDate={new Date(new Date(startDateValue ?? '').setUTCHours(24, 0, 0, 0))}
              onChange={(endDate) => {
                handleEndDate(new Date(new Date(endDate!).setUTCHours(24, 0, 0, 0)).toISOString());
              }}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  size: 'small',
                },
              }}
              label={t('End date')}
            />
          </>
        )
      }
    </div>
  );
};

export default TimeRangeFilters;
