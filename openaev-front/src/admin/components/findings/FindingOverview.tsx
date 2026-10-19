import { Chip } from '@filigran/design-system';
import { DevicesOutlined, FormatListNumberedOutlined, Groups3Outlined, PersonOutlined, ShieldOutlined } from '@mui/icons-material';
import { Alert, AlertTitle, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type QueryKey, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { fetchFinding, fetchFindingSummary, searchFindings } from '../../../actions/findings/finding-actions';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { DetailHero, Field, HeroStat, InformationGrid } from '../../../components/common/detail/EntityDetailCommon';
import FindingIcon from '../../../components/FindingIcon';
import { useFormatter } from '../../../components/i18n';
import ItemTags from '../../../components/ItemTags';
import Loader from '../../../components/Loader';
import type { FindingOutput, FindingSummaryOutput } from '../../../utils/api-types';
import { type Error as NotifiableError, notifyErrorHandler } from '../../../utils/error/errorHandlerUtil';
import { findingKey } from '../../../utils/query/keys';
import { isClientError, retryUnlessClientError } from '../../../utils/query/queryErrors';
import useNotifiedQuery, { FALLBACK_REFETCH_INTERVAL_MS } from '../../../utils/query/useNotifiedQuery';
import { emptyFilled } from '../../../utils/String';
import { isFeatureEnabled } from '../../../utils/utils';
import ContractOutputElementType from './ContractOutputElementType';
import FindingOccurrences from './FindingOccurrences';
import FindingVulnerabilityPanel from './FindingVulnerabilityPanel';

interface ViewProps {
  findingId: string;
  finding: FindingOutput;
  summary: FindingSummaryOutput | null;
  // With live updates on, the key of the finding screen: its sections are queries under it.
  queryKey?: QueryKey;
}

// Full-page finding overview: one deduplicated finding (type + value) with its
// group-wide summary (true first/last seen, occurrences, impact spread), the
// vulnerability context when it is a CVE, and the occurrence timeline.
const FindingOverviewView = ({ findingId, finding, summary, queryKey }: ViewProps) => {
  const { t, fldt } = useFormatter();
  const theme = useTheme();
  const [cvssScore, setCvssScore] = useState<number | null>(null);

  const typeLabel = useMemo(
    () => t(ContractOutputElementType[finding.finding_type] ?? finding.finding_type),
    [finding, t],
  );

  const isCVE = finding.finding_type === 'cve';

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}
    >
      <Breadcrumbs
        variant="object"
        elements={[
          {
            label: t('Findings'),
            link: '/admin/findings',
          },
          {
            label: finding.finding_value,
            current: true,
          },
        ]}
      />

      {/* Hero: shared DetailHero with the finding type as overline and the
          CVSS chip in the standard chips row (matching every other detail page). */}
      <DetailHero
        iconNode={<FindingIcon findingType={finding.finding_type} />}
        overline={typeLabel}
        title={finding.finding_value}
        chips={cvssScore != null
          ? <Chip label={`CVSS ${cvssScore.toFixed(1)}`} severity="info" />
          : undefined}
        stats={(
          <>
            <HeroStat icon={FormatListNumberedOutlined} label={t('Occurrences')} value={summary?.finding_occurrences ?? '-'} />
            <HeroStat icon={DevicesOutlined} label={t('Impacted assets')} value={summary?.finding_assets_count ?? '-'} color={theme.palette.primary.main} />
            {/* Team / person spread only shows when the finding actually touched people
                (e.g. phishing credentials): machine findings keep a compact stat row. */}
            {(summary?.finding_teams_count ?? 0) > 0 && (
              <HeroStat icon={Groups3Outlined} label={t('Impacted teams')} value={summary?.finding_teams_count ?? '-'} color={theme.palette.success.main} />
            )}
            {(summary?.finding_users_count ?? 0) > 0 && (
              <HeroStat icon={PersonOutlined} label={t('Impacted persons')} value={summary?.finding_users_count ?? '-'} color={theme.palette.success.main} />
            )}
            {isCVE && (
              <HeroStat icon={ShieldOutlined} label={t('CVSS score')} value={cvssScore != null ? cvssScore.toFixed(1) : '-'} color={theme.palette.warning.main} />
            )}
          </>
        )}
      />

      <InformationGrid title={t('Information')}>
        <Field label={t('Type')}>{typeLabel}</Field>
        <Field label={t('Value')}>
          <Box
            component="pre"
            sx={{
              margin: 0,
              padding: theme.spacing(1, 1.5),
              borderRadius: 1,
              backgroundColor: theme.palette.background.accent,
              border: `1px solid ${theme.palette.divider}`,
              fontFamily: 'Consolas, monaco, monospace',
              fontSize: 12.5,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: theme.palette.text.primary,
            }}
          >
            {finding.finding_value}
          </Box>
        </Field>
        <Field label={t('Field')}>{emptyFilled(finding.finding_field)}</Field>
        {/* Group-wide dates from the summary: the fetched row's own dates only
            cover one occurrence and would understate the group (the historical
            "first seen shows a later date" bug). */}
        <Field label={t('First seen')}>{summary ? fldt(summary.finding_first_seen) : '-'}</Field>
        <Field label={t('Last seen')}>{summary ? fldt(summary.finding_last_seen) : '-'}</Field>
        <Field label={t('Tags')}>
          <ItemTags variant="list" tags={finding.finding_tags ?? []} />
        </Field>
      </InformationGrid>

      {/* CVE context: everything known about the vulnerability (identity,
          description, remediation, weaknesses, references) in ONE paper. */}
      {isCVE && (
        <FindingVulnerabilityPanel
          cveId={finding.finding_value}
          onCvssScore={setCvssScore}
          queryKey={queryKey}
        />
      )}

      {/* Occurrence timeline: one entry per inject that produced this finding,
          as a table or a horizontal time strip. */}
      <div style={{ marginTop: theme.spacing(1) }}>
        <FindingOccurrences
          searchFindings={searchFindings}
          finding={finding}
          contextId={findingId}
          queryKey={queryKey}
        />
      </div>
    </Box>
  );
};

interface Props { findingId: string }

// Loads the finding once.
const LoadedFindingOverview = ({ findingId }: Props) => {
  const [finding, setFinding] = useState<FindingOutput | null>(null);
  // Group-wide aggregates are computed server-side: a Finding row is ONE
  // occurrence (per inject), so its own dates/links cannot answer "since when
  // and how widely has this been seen?".
  const [summary, setSummary] = useState<FindingSummaryOutput | null>(null);

  useEffect(() => {
    fetchFinding(findingId).then(response => setFinding(response.data as FindingOutput));
    fetchFindingSummary(findingId).then(response => setSummary(response.data as FindingSummaryOutput));
  }, [findingId]);

  if (!finding) {
    return <Loader />;
  }
  return <FindingOverviewView findingId={findingId} finding={finding} summary={summary} />;
};

// Live updates: every section is a query under the finding key, which the topic 'finding:<id>'
// refetches, with a slow interval as fallback.
const QueriedFindingOverview = ({ findingId }: Props) => {
  const { t } = useFormatter();
  const queryKey = findingKey(findingId);

  const { data: finding, error, isPending } = useNotifiedQuery({
    queryKey: [...findingKey(findingId), 'finding'],
    queryFn: () => fetchFinding(findingId, false).then(response => response.data as FindingOutput),
    retry: retryUnlessClientError,
    // A failing finding (deleted, rights lost) stops polling; an invalidation still refetches it.
    refetchInterval: query => (query.state.status === 'error' ? false : FALLBACK_REFETCH_INTERVAL_MS),
  });

  const summaryQuery = useQuery({
    queryKey: [...findingKey(findingId), 'summary'],
    queryFn: () => fetchFindingSummary(findingId, false).then(response => response.data as FindingSummaryOutput),
    retry: retryUnlessClientError,
    refetchInterval: query => (query.state.status === 'error' ? false : FALLBACK_REFETCH_INTERVAL_MS),
  });

  // A 4xx on the summary comes with the same 4xx on the finding, which the screen already reports.
  useEffect(() => {
    if (summaryQuery.error && !isClientError(summaryQuery.error)) {
      notifyErrorHandler(summaryQuery.error as unknown as NotifiableError);
    }
  }, [summaryQuery.errorUpdatedAt]);

  if (isPending) {
    return <Loader />;
  }

  // Deleted or no longer visible, on a first load or while on screen.
  if (isClientError(error) || !finding) {
    return (
      <Alert severity="warning">
        <AlertTitle>{t('Warning')}</AlertTitle>
        {t('Finding is currently unavailable or you do not have sufficient permissions to access it.')}
      </Alert>
    );
  }

  return (
    <FindingOverviewView
      findingId={findingId}
      finding={finding}
      summary={summaryQuery.data ?? null}
      queryKey={queryKey}
    />
  );
};

const FindingOverview = () => {
  const { findingId } = useParams() as { findingId: string };
  // Constant for a session: the screen keeps one of the two paths.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');

  return liveUpdates
    ? <QueriedFindingOverview findingId={findingId} />
    : <LoadedFindingOverview findingId={findingId} />;
};

export default FindingOverview;
