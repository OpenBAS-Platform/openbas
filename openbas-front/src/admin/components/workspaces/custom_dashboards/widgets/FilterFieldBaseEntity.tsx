import { Card, CardActionArea, CardContent, Checkbox, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useEffect, useState } from 'react';

import { engineSchemas } from '../../../../../actions/schema/schema-action';
import { useFormatter } from '../../../../../components/i18n';
import Loader from '../../../../../components/Loader';
import { type PropertySchemaDTO } from '../../../../../utils/api-types';
import { type Option } from '../../../../../utils/Option';

interface Props {
  value: string | null;
  onChange: (value: string | null) => void;
}

const ENTITIES = ['expectation-inject', 'finding', 'endpoint', 'inject'];

const FilterFieldBaseEntity: FunctionComponent<Props> = ({
  value,
  onChange,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme = useTheme();

  const [loading, setLoading] = useState<boolean>(true);
  const [entityOptions, setEntityOptions] = useState<Option[]>([]);

  useEffect(() => {
    engineSchemas().then((response: { data: PropertySchemaDTO[] }) => {
      const entities = Array.from(new Set(
        response.data.map(d => d.schema_property_entity),
      )).filter(e => ENTITIES.includes(e));
      setEntityOptions(entities.map(entity => ({
        id: entity,
        label: t(entity),
      })));
      setLoading(false);
    });
  }, []);

  const handleOnChange = (v: string) => {
    if (v === value) {
      onChange(null);
    } else {
      onChange(v);
    }
  };

  if (loading) {
    return <Loader variant="inElement" />;
  }

  return (
    <div style={{
      display: 'grid',
      gap: `${theme.spacing(1)}`,
      gridTemplateColumns: '1fr 1fr',
    }}
    >
      {entityOptions.map(option => (
        <Card
          key={option.id}
          variant="outlined"
        >
          <CardActionArea onClick={() => handleOnChange(option.id)}>
            <CardContent sx={{
              p: 0,
              display: 'grid',
              gridTemplateColumns: '50px 1fr',
              alignItems: 'center',
            }}
            >
              <Checkbox checked={value === option.id} />
              <Typography style={{ textAlign: 'center' }}>
                {t(option.label)}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </div>
  );
};

export default FilterFieldBaseEntity;
