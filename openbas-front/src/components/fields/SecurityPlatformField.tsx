import React, { CSSProperties, FunctionComponent } from 'react';
import { Autocomplete as MuiAutocomplete, Box, TextField } from '@mui/material';
import { makeStyles, useTheme } from '@mui/styles';
import { FieldErrors } from 'react-hook-form';
import { useAppDispatch } from '../../utils/hooks';
import useDataLoader from '../../utils/hooks/useDataLoader';
import type { SecurityPlatform } from '../../utils/api-types';
import { useHelper } from '../../store';
import { fetchSecurityPlatforms } from '../../actions/assets/securityPlatform-actions';
import type { SecurityPlatformHelper } from '../../actions/assets/asset-helper';
import type { Theme } from '../Theme';

const useStyles = makeStyles(() => ({
  icon: {
    paddingTop: 4,
    display: 'inline-block',
  },
  text: {
    display: 'inline-block',
    flexGrow: 1,
    marginLeft: 10,
  },
  autoCompleteIndicator: {
    display: 'none',
  },
}));

interface Props {
  name: string;
  label: string;
  fieldValue: string;
  fieldOnChange: (value: string) => void;
  errors: FieldErrors;
  style: CSSProperties;
  onlyManual?: boolean;
}

const SecurityPlatformField: FunctionComponent<Props> = ({
  name,
  label,
  fieldValue,
  fieldOnChange,
  errors,
  style,
  onlyManual,
}) => {
  // Standard hooks
  const theme = useTheme<Theme>();
  const classes = useStyles();

  // Fetching data
  const { securityPlatforms }: { securityPlatforms: [SecurityPlatform]; } = useHelper((helper: SecurityPlatformHelper) => ({
    securityPlatforms: helper.getSecurityPlatforms(),
  }));
  const dispatch = useAppDispatch();
  useDataLoader(() => {
    dispatch(fetchSecurityPlatforms());
  });

  // Form
  const securityPlatformsOptions = securityPlatforms
    .filter((n) => (onlyManual ? n.asset_external_reference === null : true))
    .map(
      (n) => ({
        id: n.asset_id,
        label: n.asset_name,
        logo_dark: n.security_platform_logo_dark,
        logo_light: n.security_platform_logo_light,
      }),
    );
  const valueResolver = () => {
    return securityPlatformsOptions.filter((securityPlatform) => fieldValue === securityPlatform.id).at(0);
  };

  return (
    <div style={{ position: 'relative' }}>
      <MuiAutocomplete
        value={valueResolver()}
        size="small"
        multiple={false}
        selectOnFocus
        autoHighlight
        clearOnBlur={false}
        clearOnEscape={false}
        options={securityPlatformsOptions}
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
                  style={{ width: 25, height: 25, borderRadius: 4 }}
                />
              </div>
              <div className={classes.text}>{option.label}</div>
            </Box>
          );
        }}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
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
