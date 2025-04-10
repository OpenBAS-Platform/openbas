import { memo, useEffect, useState } from 'react';

import { series } from '../../../../../actions/dashboards/dashboard-action';
import Loader from '../../../../../components/Loader';
import { type EsSeries, type Widget } from '../../../../../utils/api-types';
import { isEmptyField, isNotEmptyField } from '../../../../../utils/utils';
import MatrixMitre from './viz/MatrixMitre';

interface WidgetStructuralVizProps { widget: Widget }

const WidgetStructuralViz = ({ widget }: WidgetStructuralVizProps) => {
  const [structuralVizData, setStructuralVizData] = useState<EsSeries[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    series(widget.widget_id).then((response) => {
      if (response.data && isNotEmptyField(response.data)) {
        setStructuralVizData(response.data);
        setLoading(false);
      } else if (response.data && isEmptyField(response.data.at(0))) {
        setLoading(false);
      }
    });
  }, [widget]);

  if (loading) {
    return <Loader variant="inElement" />;
  }

  console.log(structuralVizData);

  switch (widget.widget_type) {
    case 'security-coverage':
      return (
        <MatrixMitre data={structuralVizData} />
      );
    case 'line':
      return (

        <div>coucou</div>
      );
    case 'vertical-barchart':
      return (
        <div>coucou 2</div>
      );
    default:
      return 'Not implemented yet';
  }
};

export default memo(WidgetStructuralViz);
