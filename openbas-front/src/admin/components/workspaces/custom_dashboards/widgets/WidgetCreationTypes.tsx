import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent } from 'react';

import { useFormatter } from '../../../../../components/i18n';
import { type Widget } from '../../../../../utils/api-types';
import { renderWidgetIcon, widgetVisualizationTypes } from './WidgetUtils';

const WidgetCreationTypes: FunctionComponent<{ onChange: (type: Widget['widget_type']) => void }> = ({ onChange }) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme = useTheme();

  return (
    <div
      style={{
        display: 'grid',
        gap: `0px ${theme.spacing(3)}`,
        gridTemplateColumns: '1fr 1fr 1fr',
      }}
    >
      {widgetVisualizationTypes.map(visualizationType => (
        <Card
          key={visualizationType.category}
          variant="outlined"
          style={{
            height: 100,
            textAlign: 'center',
          }}
        >
          <CardActionArea
            onClick={() => onChange(visualizationType.category)}
            aria-label={t(visualizationType.name)}
          >
            <CardContent>
              {renderWidgetIcon(visualizationType.category, 'large')}
              <Typography
                gutterBottom
                variant="body1"
                sx={{ mt: 1 }}
              >
                {t(visualizationType.name)}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </div>
  );
};

export default WidgetCreationTypes;
