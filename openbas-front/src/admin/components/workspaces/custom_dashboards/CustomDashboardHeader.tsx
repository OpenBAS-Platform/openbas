import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DateTimePicker } from '@mui/x-date-pickers';
import { sub } from 'date-fns';
import { type FunctionComponent, useCallback, useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import { updateCustomDashboardTimeRange } from '../../../../actions/custom_dashboards/customdashboard-action';
import { useFormatter } from '../../../../components/i18n';
import { type CustomDashboard, type CustomDashboardTimeFilterInput } from '../../../../utils/api-types';
import { truncate } from '../../../../utils/String';
import CustomDashboardPopover from './CustomDashboardPopover';

const useStyles = makeStyles()(() => ({
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    alignItems: 'center',
  },
  rightAligned: { justifySelf: 'end' },
}));

interface Props { customDashboard: CustomDashboard }

const CustomDashboardHeader: FunctionComponent<Props> = ({ customDashboard }) => {
  // Standard hooks
  const { classes } = useStyles();
  const { t } = useFormatter();
  const theme = useTheme();

  const [currentCustomDashboard, setCustomDashboard] = useState(customDashboard);
  const [timeRangeValue, setTimeRangeValue] = useState<CustomDashboardTimeFilterInput['custom_dashboard_time_range']>(customDashboard.custom_dashboard_time_range);
  const [startDateValue, setStartDateValue] = useState<CustomDashboardTimeFilterInput['custom_dashboard_start_date']>(customDashboard.custom_dashboard_start_date);
  const [endDateValue, setEndDateValue] = useState<CustomDashboardTimeFilterInput['custom_dashboard_end_date']>(customDashboard.custom_dashboard_end_date);

  const handleUpdate = useCallback(
    (customDashboard: CustomDashboard) => {
      setCustomDashboard({
        ...currentCustomDashboard,
        ...customDashboard,
      });
    },
    [],
  );

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

  const submitTimeRange = async (data: CustomDashboardTimeFilterInput) => {
    await updateCustomDashboardTimeRange(customDashboard.custom_dashboard_id, data);
  };

  const setDatesToNull = (timeRangePrev: CustomDashboardTimeFilterInput['custom_dashboard_time_range'], timRangeCur: CustomDashboardTimeFilterInput['custom_dashboard_time_range']) => {
    if (timeRangePrev !== 'CUSTOM' && timRangeCur === 'CUSTOM') {
      setStartDateValue('');
      setEndDateValue('');
    }
  };

  const sendDataFromRanges = (timeRange: CustomDashboardTimeFilterInput['custom_dashboard_time_range']) => {
    if (timeRange === 'ALL_TIME') {
      submitTimeRange({
        custom_dashboard_time_range: 'ALL_TIME',
        custom_dashboard_start_date: '',
        custom_dashboard_end_date: '',
      });
    } else if (timeRange === 'LAST_DAY') {
      submitTimeRange({
        custom_dashboard_time_range: 'LAST_DAY',
        custom_dashboard_start_date: sub(new Date(), { hours: 24 }).toString(),
        custom_dashboard_end_date: new Date().toString(),
      });
    } else if (timeRange === 'LAST_WEEK') {
      submitTimeRange({
        custom_dashboard_time_range: 'LAST_WEEK',
        custom_dashboard_start_date: sub(new Date(), { hours: 168 }).toISOString(),
        custom_dashboard_end_date: new Date().toISOString(),
      });
    } else if (timeRange === 'LAST_MONTH') {
      submitTimeRange({
        custom_dashboard_time_range: 'LAST_MONTH',
        custom_dashboard_start_date: sub(new Date(), { months: 1 }).toISOString(),
        custom_dashboard_end_date: new Date().toISOString(),
      });
    } else if (timeRange === 'LAST_QUARTER') {
      submitTimeRange({
        custom_dashboard_time_range: 'LAST_QUARTER',
        custom_dashboard_start_date: sub(new Date(), { months: 3 }).toISOString(),
        custom_dashboard_end_date: new Date().toISOString(),
      });
    } else if (timeRange === 'LAST_SEMESTER') {
      submitTimeRange({
        custom_dashboard_time_range: 'LAST_SEMESTER',
        custom_dashboard_start_date: sub(new Date(), { months: 6 }).toISOString(),
        custom_dashboard_end_date: new Date().toISOString(),
      });
    } else if (timeRange === 'LAST_YEAR') {
      submitTimeRange({
        custom_dashboard_time_range: 'LAST_YEAR',
        custom_dashboard_start_date: sub(new Date(), { years: 1 }).toISOString(),
        custom_dashboard_end_date: new Date().toISOString(),
      });
    }
  };

  return (
    <div className={classes.container}>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        gap: theme.spacing(2),
      }}
      >
        <Tooltip title={currentCustomDashboard.custom_dashboard_name}>
          <Typography variant="h1" style={{ margin: 0 }}>
            {truncate(currentCustomDashboard.custom_dashboard_name, 80)}
          </Typography>
        </Tooltip>
        <FormControl size="small">
          <InputLabel id="customDashboardTimeRangeSelectLabel" variant="outlined">{t('Time range')}</InputLabel>
          <Select
            labelId="customDashboardTimeRangeSelectLabel"
            label={t('Time range')}
            id="customDashboardTimeRangeSelect"
            variant="outlined"
            value={timeRangeValue}
            onChange={(event: SelectChangeEvent<CustomDashboardTimeFilterInput['custom_dashboard_time_range']>) => {
              setDatesToNull(timeRangeValue, event.target.value);
              sendDataFromRanges(event.target.value);
              setTimeRangeValue(event.target.value);
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
                  setStartDateValue(startDate?.toISOString());
                  submitTimeRange({
                    custom_dashboard_time_range: timeRangeValue,
                    custom_dashboard_start_date: new Date(new Date(startDate!).setUTCHours(24, 0, 0, 0)).toISOString(),
                    custom_dashboard_end_date: endDateValue,
                  });
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
                  setEndDateValue(endDate?.toISOString());
                  submitTimeRange({
                    custom_dashboard_time_range: timeRangeValue,
                    custom_dashboard_start_date: startDateValue,
                    custom_dashboard_end_date: new Date(new Date(endDate!).setUTCHours(24, 0, 0, 0)).toISOString(),
                  });
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
      <div className={classes.rightAligned}>
        <CustomDashboardPopover
          customDashboard={currentCustomDashboard}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
};
export default CustomDashboardHeader;
