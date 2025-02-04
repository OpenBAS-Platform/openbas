import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FunctionComponent, useEffect, useState } from 'react';

import { fetchPayload } from '../../../actions/payloads/Payload-action';
import { useFormatter } from '../../../components/i18n';
import { Payload as PayloadType } from '../../../utils/api-types';

interface Props {
  payload: PayloadType;
  onChange: (payload: PayloadType) => void;
}

const PayloadComponentVersion: FunctionComponent<Props> = ({
  payload,
  onChange,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme = useTheme();

  // Fixme: version option only for external id and version property

  const [version, setVersion] = useState<number | null>(payload.payload_version);
  useEffect(() => {
    if (version !== null) {
      fetchPayload(payload.payload_external_id, version).then(result => onChange(result.data));
    }
  }, [payload, version]);

  const availableVersions = Array.from({ length: payload.payload_version }, (_, i) => i + 1);

  return (
    <FormControl sx={{ marginTop: theme.spacing(2), width: '100px' }}>
      <InputLabel id="version-select-label">
        {t('Version')}
      </InputLabel>
      <Select
        labelId="version-select-label"
        value={version}
        label="Version"
        onChange={event => setVersion(event.target.value)}
      >
        {availableVersions.map(version => (
          <MenuItem key={version} value={version}>
            {version}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default PayloadComponentVersion;
