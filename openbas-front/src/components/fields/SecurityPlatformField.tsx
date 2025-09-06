import { Autocomplete as MuiAutocomplete, Box, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type CSSProperties, type FunctionComponent } from 'react';
import { type FieldErrors } from 'react-hook-form';
import { makeStyles } from 'tss-react/mui';

import { type SecurityPlatformHelper } from '../../actions/assets/asset-helper';
import { fetchSecurityPlatforms } from '../../actions/assets/securityPlatform-actions';
import { useHelper } from '../../store';
import { type SecurityPlatform } from '../../utils/api-types';
import { useAppDispatch } from '../../utils/hooks';
import useDataLoader from '../../utils/hooks/useDataLoader';

const useStyles = makeStyles()(() => ({
  icon: {
    paddingTop: 4,
    display: 'inline-block',
  },
  text: {
    display: 'inline-block',
    flexGrow: 1,
    marginLeft: 10,
  },
  autoCompleteIndicator: { display: 'none' },
}));

interface Props {
  name: string;
  label: string;
  fieldValue: string;
  fieldOnChange: (value: string) => void;
  errors: FieldErrors;
  filterOptions: (securityPlatform: SecurityPlatform) => boolean;
  style: CSSProperties;
  editing: boolean;
}

const securityPlatformsToOptions = (securityPlatforms: SecurityPlatform[], filterOptions: (securityPlatform: SecurityPlatform) => boolean) => {
  return securityPlatforms
    .filter(filterOptions)
    .map(n => ({
      id: n.asset_id,
      label: n.asset_name,
      logo_dark: n.security_platform_logo_dark,
      logo_light: n.security_platform_logo_light,
      type: n.security_platform_type,
    }));
};

const SecurityPlatformField: FunctionComponent<Props> = ({
  name,
  label,
  fieldValue,
  fieldOnChange,
  errors,
  filterOptions,
  style,
  editing,
}) => {
  // Standard hooks
  const theme = useTheme();
  const { classes } = useStyles();
  const dispatch = useAppDispatch();

  // Fetching data
  const { securityPlatforms }: { securityPlatforms: SecurityPlatform[] } = useHelper((helper: SecurityPlatformHelper) => ({ securityPlatforms: helper.getSecurityPlatforms() }));
  useDataLoader(() => {
    dispatch(fetchSecurityPlatforms());
  });

  // Form
  const securityPlatformsOptions = securityPlatformsToOptions(securityPlatforms, filterOptions);

  const selectedValue = securityPlatformsOptions.find(option => option.id === fieldValue) || null;

  return (
    <div style={{ position: 'relative' }}>
      <MuiAutocomplete
        value={selectedValue}
        size="small"
        selectOnFocus
        autoHighlight
        options={securityPlatformsOptions}
        getOptionLabel={option => option ? `${option.label} (${option.type})` : ''}
        disabled={editing}
        onChange={(_, value) => {
          fieldOnChange(value?.id ?? '');
        }}
        renderOption={(props, option) => {
          return (
            <Box component="li" {...props} key={option.id}>
              <div className={classes.icon}>
                <img
                  src={`/api/images/security_platforms/id/${option.id}/${theme.palette.mode}`}
                  alt={option.label}
                  style={{
                    width: 25,
                    height: 25,
                    borderRadius: 4,
                  }}
                />
              </div>
              <div className={classes.text}>
                {`${option.label} (${option.type})`}
              </div>
            </Box>
          );
        }}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={params => (
          <TextField
            {...params}
            label={label}
            variant="standard"
            fullWidth
            style={style}
            error={!!errors[name]}
          />
        )}
        classes={{ clearIndicator: classes.autoCompleteIndicator }}
      />
    </div>
  );
};

export default SecurityPlatformField;
