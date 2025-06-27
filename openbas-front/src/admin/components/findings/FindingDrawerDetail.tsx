import Drawer from '../../../components/common/Drawer';
import type { Page } from '../../../components/common/queryable/Page';
import type { Header } from '../../../components/common/SortHeadersList';
import type { FindingOutput, SearchPaginationInput } from '../../../utils/api-types';
import FindingDetail from './FindingDetail';

interface Props {
  selectedFinding: FindingOutput | null;
  setSelectedFinding: (finding: FindingOutput | null) => void;
  setCvssScore: (score: number | null) => void;
  cvssScore: number | null;
  contextId?: string;
  searchFindings: (input: SearchPaginationInput) => Promise<{ data: Page<FindingOutput> }>;
  additionalHeaders?: Header[];
  additionalFilterNames?: string[];
}

const FindingDrawerDetail = ({
  selectedFinding,
  setSelectedFinding,
  setCvssScore,
  cvssScore,
  contextId,
  searchFindings,
  additionalHeaders,
  additionalFilterNames,
}: Props) => {
  if (!selectedFinding?.finding_value) return null;

  return (
    <Drawer
      open={Boolean(selectedFinding)}
      handleClose={() => {
        setSelectedFinding(null);
        setCvssScore(null);
      }}
      title={selectedFinding.finding_value}
      additionalTitle={cvssScore ? 'CVSS' : undefined}
      additionalChipLabel={cvssScore?.toFixed(1)}
    >
      <FindingDetail
        selectedFinding={selectedFinding}
        searchFindings={searchFindings}
        contextId={contextId}
        additionalHeaders={additionalHeaders}
        additionalFilterNames={additionalFilterNames}
        onCvssScore={setCvssScore}
      />
    </Drawer>
  );
};

export default FindingDrawerDetail;
