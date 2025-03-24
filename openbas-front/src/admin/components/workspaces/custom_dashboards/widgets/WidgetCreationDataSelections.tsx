import { AddOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';
import { type FunctionComponent } from 'react';

import { emptyFilterGroup } from '../../../../../components/common/queryable/filter/FilterUtils';
import { useFormatter } from '../../../../../components/i18n';
import { type Widget, type WidgetDataSelection } from '../../../../../utils/api-types';
import WidgetCreationDataSelection from './WidgetCreationDataSelection';
import { getCurrentDataSelectionsLimit } from './WidgetUtils';

const WidgetCreationDataSelections: FunctionComponent<{
  widgetType: Widget['widget_type'];
  value: Widget['widget_data_selections'];
  onChange: (dataSelection: WidgetDataSelection[]) => void;
  onSubmit: () => void;
}> = ({ widgetType, value, onChange, onSubmit }) => {
  // Standard hooks
  const { t } = useFormatter();

  const onChangeDataSelection = (index: number, dataSelection: WidgetDataSelection) => {
    const newDatas = value.map((data, n) => {
      if (n === index) {
        return dataSelection;
      }
      return data;
    });
    onChange(newDatas);
  };

  const handleRemoveDataSelection = (index: number) => {
    const newDataSelection = Array.from(value);
    newDataSelection.splice(index, 1);
    onChange(newDataSelection);
  };
  const handleAddDataSelection = () => {
    onChange([
      ...value,
      {
        widget_data_selection_label: '',
        widget_data_selection_filter: emptyFilterGroup,
      },
    ]);
  };

  return (
    <div style={{ marginTop: 20 }}>
      {value.map((dataSelection, index) => {
        return (
          <WidgetCreationDataSelection
            key={index}
            index={index}
            dataSelection={dataSelection}
            onChange={dataSelection => onChangeDataSelection(index, dataSelection)}
            onRemove={handleRemoveDataSelection}
          />
        );
      })}
      <div style={{ display: 'flex' }}>
        <Button
          variant="contained"
          disabled={getCurrentDataSelectionsLimit(widgetType) === value.length}
          color="secondary"
          size="small"
          onClick={handleAddDataSelection}
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

export default WidgetCreationDataSelections;
