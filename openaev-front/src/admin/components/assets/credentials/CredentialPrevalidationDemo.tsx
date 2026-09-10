import { Block, CheckCircleOutline, ErrorOutline, HourglassEmpty, WarningAmberOutlined } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Alert, AlertTitle, Chip, FormControlLabel, MenuItem, Switch, TextField } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';

import Breadcrumbs from '../../../../components/Breadcrumbs';
import { useFormatter } from '../../../../components/i18n';

// ---------------------------------------------------------------------------
// DEMO / MOCKUP ONLY — no backend calls.
// This page is a static+interactive UI preview built to let Product/Design
// click through the "credential prevalidation gate" states described in
// US4 "Use credentials in injects workflow" (GH #5638) before any backend
// work (inject schema, CREDENTIAL_PREVALIDATION state, gate) is implemented.
// Safe to delete once the real feature is built.
// ---------------------------------------------------------------------------

type CredentialStatus = 'ACTIVE' | 'INACTIVE' | 'UNSET';

interface MockCredential {
  id: string;
  name: string;
  type: 'IDENTITY' | 'CLOUD_AWS';
  status: CredentialStatus;
  lastVerifiedHoursAgo: number | null;
}

const MOCK_CREDENTIALS: MockCredential[] = [
  {
    id: 'aws-fresh-active',
    name: 'AWS GuardDuty Read-Only Key (Active, tested 1h ago)',
    type: 'CLOUD_AWS',
    status: 'ACTIVE',
    lastVerifiedHoursAgo: 1,
  },
  {
    id: 'aws-stale-active',
    name: 'AWS Cross-Account Assume Role (Active, tested 9h ago — stale)',
    type: 'CLOUD_AWS',
    status: 'ACTIVE',
    lastVerifiedHoursAgo: 9,
  },
  {
    id: 'aws-inactive-fresh',
    name: 'AWS Red Team Access Key (Inactive, tested 2h ago)',
    type: 'CLOUD_AWS',
    status: 'INACTIVE',
    lastVerifiedHoursAgo: 2,
  },
  {
    id: 'identity-never-tested',
    name: 'SSH Prod Web Server (username/password, never tested)',
    type: 'IDENTITY',
    status: 'UNSET',
    lastVerifiedHoursAgo: null,
  },
  {
    id: 'hash-never-tested',
    name: 'Domain Admin NTLM Hash (never tested)',
    type: 'IDENTITY',
    status: 'UNSET',
    lastVerifiedHoursAgo: null,
  },
];

const DELETED_CREDENTIAL_ID = '__deleted_reference__';
const NONE_ID = '__none__';

type OutcomeState
  = | 'SKIPPED_NOT_REQUIRED'
    | 'PASS_CACHED'
    | 'VALIDATING'
    | 'PASS_RETESTED'
    | 'BLOCKED_RETEST_FAILED'
    | 'BLOCKED_INACTIVE_CACHED'
    | 'BLOCKED_NEVER_TESTED'
    | 'BLOCKED_NOT_FOUND'
    | 'BLOCKED_MISSING'
    | 'BLOCKED_VAULT_UNREACHABLE'
    | 'BLOCKED_RUNTIME_REVOKED';

interface OutcomeConfig {
  queueChip: 'QUEUED' | 'CREDENTIAL_PREVALIDATION' | 'PENDING' | 'EXECUTING' | 'ERROR';
  severity: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  errorCode?: string;
  showRetestCta?: boolean;
}

const OUTCOME_CONFIG: Record<OutcomeState, OutcomeConfig> = {
  SKIPPED_NOT_REQUIRED: {
    queueChip: 'PENDING',
    severity: 'info',
    title: 'No prevalidation needed',
    message: 'This injector contract has requires_credential = false. The inject moves directly from QUEUED to PENDING.',
  },
  PASS_CACHED: {
    queueChip: 'PENDING',
    severity: 'success',
    title: 'Credential valid (cached result)',
    message: 'Status "Active", last tested less than 4h ago — cached result used. The inject moves from QUEUED to PENDING.',
  },
  VALIDATING: {
    queueChip: 'CREDENTIAL_PREVALIDATION',
    severity: 'info',
    title: 'Re-testing credential…',
    message: 'Last test is older than 4h — running the full connectivity test now (timeout 15s) before deciding.',
  },
  PASS_RETESTED: {
    queueChip: 'PENDING',
    severity: 'success',
    title: 'Re-test succeeded',
    message: 'The smart re-test passed. Status refreshed to "Active", "Last tested" timestamp updated. The inject moves to PENDING.',
  },
  BLOCKED_RETEST_FAILED: {
    queueChip: 'ERROR',
    severity: 'error',
    title: 'Credential re-test failed',
    message: 'Credential re-test failed — AUTH_FAILED. Status updated to "Inactive".',
    errorCode: 'CREDENTIAL_RETEST_FAILED',
    showRetestCta: true,
  },
  BLOCKED_INACTIVE_CACHED: {
    queueChip: 'ERROR',
    severity: 'error',
    title: 'Credential inactive',
    message: 'Credential inactive since last test (< 4h ago, cached) — AUTH_FAILED.',
    errorCode: 'CREDENTIAL_INACTIVE',
    showRetestCta: true,
  },
  BLOCKED_NEVER_TESTED: {
    queueChip: 'ERROR',
    severity: 'error',
    title: 'Credential never tested',
    message: 'Credential never tested — run Test Connection first.',
    errorCode: 'CREDENTIAL_NEVER_TESTED',
    showRetestCta: true,
  },
  BLOCKED_NOT_FOUND: {
    queueChip: 'ERROR',
    severity: 'error',
    title: 'Credential not found',
    message: 'Credential not found — it may have been deleted.',
    errorCode: 'CREDENTIAL_NOT_FOUND',
  },
  BLOCKED_MISSING: {
    queueChip: 'ERROR',
    severity: 'error',
    title: 'Credential required',
    message: 'This inject requires a credential — assign one before execution.',
    errorCode: 'CREDENTIAL_MISSING',
  },
  BLOCKED_VAULT_UNREACHABLE: {
    queueChip: 'ERROR',
    severity: 'warning',
    title: 'Vault unreachable',
    message: 'Cannot resolve credential — Vault unreachable. Retry later.',
    errorCode: 'VAULT_UNREACHABLE',
  },
  BLOCKED_RUNTIME_REVOKED: {
    queueChip: 'ERROR',
    severity: 'error',
    title: 'Runtime credential failure',
    message: 'The credential was revoked externally while the inject was EXECUTING. Status updated to "Inactive" for future checks.',
    errorCode: 'RUNTIME_CREDENTIAL_FAILURE',
  },
};

const QUEUE_CHIP_COLOR: Record<OutcomeConfig['queueChip'], 'default' | 'info' | 'success' | 'error'> = {
  QUEUED: 'default',
  CREDENTIAL_PREVALIDATION: 'info',
  PENDING: 'success',
  EXECUTING: 'info',
  ERROR: 'error',
};

// Scenario-report example (static): 5 injects launched together, prevalidated independently.
const SCENARIO_REPORT_ROWS: {
  inject: string;
  credential: string;
  outcome: OutcomeState;
}[] = [
  {
    inject: '#1 — List S3 buckets',
    credential: 'AWS GuardDuty Read-Only Key',
    outcome: 'PASS_CACHED',
  },
  {
    inject: '#2 — Disable CloudTrail logging',
    credential: 'AWS Red Team Access Key',
    outcome: 'BLOCKED_INACTIVE_CACHED',
  },
  {
    inject: '#3 — SSH login attempt',
    credential: 'SSH Prod Web Server',
    outcome: 'BLOCKED_NEVER_TESTED',
  },
  {
    inject: '#4 — NetExec pass-the-hash',
    credential: 'Domain Admin NTLM Hash',
    outcome: 'BLOCKED_NEVER_TESTED',
  },
  {
    inject: '#5 — Local recon (no cloud/creds)',
    credential: '—',
    outcome: 'SKIPPED_NOT_REQUIRED',
  },
];

const CredentialPrevalidationDemo = () => {
  const { t } = useFormatter();
  const theme = useTheme();

  const [selectedId, setSelectedId] = useState<string>(NONE_ID);
  const [requiresCredential, setRequiresCredential] = useState(true);
  const [simulateVaultDown, setSimulateVaultDown] = useState(false);
  const [simulateRuntimeRevocation, setSimulateRuntimeRevocation] = useState(false);
  const [retestOutcomeChoice, setRetestOutcomeChoice] = useState<'success' | 'fail'>('success');
  const [manualRetestRunning, setManualRetestRunning] = useState(false);
  const [manualRetestDone, setManualRetestDone] = useState(false);

  const selectedCredential = useMemo(
    () => MOCK_CREDENTIALS.find(c => c.id === selectedId) ?? null,
    [selectedId],
  );

  const resetRetestState = (nextId: string) => {
    setSelectedId(nextId);
    setManualRetestRunning(false);
    setManualRetestDone(false);
  };

  const outcome: OutcomeState = useMemo(() => {
    if (simulateVaultDown) return 'BLOCKED_VAULT_UNREACHABLE';
    if (selectedId === NONE_ID) {
      return requiresCredential ? 'BLOCKED_MISSING' : 'SKIPPED_NOT_REQUIRED';
    }
    if (selectedId === DELETED_CREDENTIAL_ID) return 'BLOCKED_NOT_FOUND';
    if (!selectedCredential) return 'BLOCKED_NOT_FOUND';

    if (simulateRuntimeRevocation) return 'BLOCKED_RUNTIME_REVOKED';

    if (selectedCredential.status === 'UNSET') return 'BLOCKED_NEVER_TESTED';

    const isStale = selectedCredential.lastVerifiedHoursAgo === null || selectedCredential.lastVerifiedHoursAgo >= 4;

    if (!isStale) {
      return selectedCredential.status === 'ACTIVE' ? 'PASS_CACHED' : 'BLOCKED_INACTIVE_CACHED';
    }

    // Stale (>= 4h) => smart re-test kicks in.
    if (manualRetestRunning) return 'VALIDATING';
    if (manualRetestDone) {
      return retestOutcomeChoice === 'success' ? 'PASS_RETESTED' : 'BLOCKED_RETEST_FAILED';
    }
    // Not retested yet: show validating state by default for a stale credential.
    return 'VALIDATING';
  }, [
    simulateVaultDown,
    selectedId,
    selectedCredential,
    requiresCredential,
    simulateRuntimeRevocation,
    manualRetestRunning,
    manualRetestDone,
    retestOutcomeChoice,
  ]);

  const config = OUTCOME_CONFIG[outcome];

  const runSimulatedRetest = () => {
    setManualRetestRunning(true);
    setManualRetestDone(false);
    setTimeout(() => {
      setManualRetestRunning(false);
      setManualRetestDone(true);
    }, 1200);
  };

  const stateIcon = (severity: OutcomeConfig['severity']) => {
    switch (severity) {
      case 'success': return <CheckCircleOutline fontSize="small" />;
      case 'warning': return <WarningAmberOutlined fontSize="small" />;
      case 'info': return <HourglassEmpty fontSize="small" />;
      default: return <ErrorOutline fontSize="small" />;
    }
  };

  return (
    <section>
      <Breadcrumbs
        variant="list"
        elements={[
          {
            label: t('Credentials'),
            link: '/admin/credentials',
          },
          {
            label: t('Prevalidation gate — UI preview (US4)'),
            current: true,
          },
        ]}
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>{t('Demo page — no backend calls')}</AlertTitle>
        {t('This page mocks the "credential prevalidation gate" UI described in US4 (GH #5638): credential selector on an inject, the QUEUED → CREDENTIAL_PREVALIDATION → PENDING/ERROR banner, and the scenario report. Everything below is computed client-side from static mock data so every case can be clicked through before the backend gate exists.')}
      </Alert>

      <div style={{
        display: 'flex',
        gap: theme.spacing(4),
        flexWrap: 'wrap',
        marginBottom: theme.spacing(4),
      }}
      >
        <div style={{
          flex: '1 1 420px',
          minWidth: 360,
        }}
        >
          <h3 style={{ marginTop: 0 }}>{t('1. Credential selector on inject configuration')}</h3>

          <TextField
            select
            fullWidth
            label={t('Credential')}
            value={selectedId}
            onChange={e => resetRetestState(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value={NONE_ID}>{t('— No credential assigned —')}</MenuItem>
            {MOCK_CREDENTIALS.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
            <MenuItem value={DELETED_CREDENTIAL_ID}>
              {t('⚠️ Legacy reference to a deleted credential')}
            </MenuItem>
          </TextField>

          <FormControlLabel
            sx={{
              display: 'flex',
              mb: 1,
            }}
            control={(
              <Switch
                checked={requiresCredential}
                onChange={e => setRequiresCredential(e.target.checked)}
              />
            )}
            label={t('Injector contract: requires_credential = true')}
          />
          <FormControlLabel
            sx={{
              display: 'flex',
              mb: 1,
            }}
            control={(
              <Switch
                checked={simulateVaultDown}
                onChange={e => setSimulateVaultDown(e.target.checked)}
              />
            )}
            label={t('Simulate: Vault unreachable at resolution time')}
          />
          <FormControlLabel
            sx={{
              display: 'flex',
              mb: 2,
            }}
            control={(
              <Switch
                checked={simulateRuntimeRevocation}
                onChange={e => setSimulateRuntimeRevocation(e.target.checked)}
              />
            )}
            label={t('Simulate: credential revoked externally during EXECUTING')}
          />

          {outcome === 'VALIDATING' && !manualRetestRunning && !manualRetestDone && (
            <div style={{ marginBottom: theme.spacing(2) }}>
              <TextField
                select
                size="small"
                label={t('Simulate re-test result')}
                value={retestOutcomeChoice}
                onChange={e => setRetestOutcomeChoice(e.target.value as 'success' | 'fail')}
                sx={{
                  mr: 2,
                  minWidth: 220,
                }}
              >
                <MenuItem value="success">{t('Succeeds (still Active)')}</MenuItem>
                <MenuItem value="fail">{t('Fails (AUTH_FAILED)')}</MenuItem>
              </TextField>
              <LoadingButton variant="contained" onClick={runSimulatedRetest}>
                {t('Run smart re-test now')}
              </LoadingButton>
            </div>
          )}

          {config.showRetestCta && (
            <LoadingButton variant="outlined" color="primary" sx={{ mb: 2 }} onClick={() => resetRetestState(selectedId)}>
              {t('Run Test Connection')}
            </LoadingButton>
          )}
        </div>

        <div style={{
          flex: '1 1 420px',
          minWidth: 360,
        }}
        >
          <h3 style={{ marginTop: 0 }}>{t('Prevalidation status banner')}</h3>
          <div style={{ marginBottom: theme.spacing(2) }}>
            <Chip
              size="small"
              label={config.queueChip}
              color={QUEUE_CHIP_COLOR[config.queueChip]}
              icon={stateIcon(config.severity)}
              sx={{
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            />
          </div>
          <Alert severity={config.severity} icon={stateIcon(config.severity)}>
            <AlertTitle>{config.title}</AlertTitle>
            {config.message}
            {config.errorCode && (
              <div style={{ marginTop: theme.spacing(1) }}>
                <Chip size="small" label={config.errorCode} variant="outlined" />
              </div>
            )}
          </Alert>
        </div>
      </div>

      <h3>{t('2. All prevalidation states — quick reference')}</h3>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing(2),
        marginBottom: theme.spacing(4),
      }}
      >
        {(Object.keys(OUTCOME_CONFIG) as OutcomeState[]).map((state) => {
          const c = OUTCOME_CONFIG[state];
          return (
            <div
              key={state}
              style={{
                flex: '1 1 300px',
                minWidth: 280,
                maxWidth: 380,
                border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                borderRadius: Number(theme.shape.borderRadius),
                padding: theme.spacing(2),
              }}
            >
              <Chip
                size="small"
                label={c.queueChip}
                color={QUEUE_CHIP_COLOR[c.queueChip]}
                sx={{
                  mb: 1,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              />
              <div style={{
                fontWeight: 700,
                marginBottom: 4,
              }}
              >
                {t(c.title)}
              </div>
              <div style={{
                fontSize: 13,
                opacity: 0.8,
                marginBottom: 6,
              }}
              >
                {t(c.message)}
              </div>
              {c.errorCode && <Chip size="small" variant="outlined" label={c.errorCode} />}
            </div>
          );
        })}
      </div>

      <h3>{t('3. Scenario execution report — independent prevalidation')}</h3>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
      }}
      >
        <thead>
          <tr>
            <th style={{
              textAlign: 'left',
              padding: 8,
              borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.2)}`,
            }}
            >
              {t('Inject')}
            </th>
            <th style={{
              textAlign: 'left',
              padding: 8,
              borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.2)}`,
            }}
            >
              {t('Credential')}
            </th>
            <th style={{
              textAlign: 'left',
              padding: 8,
              borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.2)}`,
            }}
            >
              {t('Result')}
            </th>
          </tr>
        </thead>
        <tbody>
          {SCENARIO_REPORT_ROWS.map((row) => {
            const rowConfig = OUTCOME_CONFIG[row.outcome];
            return (
              <tr key={row.inject}>
                <td style={{
                  padding: 8,
                  borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                }}
                >
                  {row.inject}
                </td>
                <td style={{
                  padding: 8,
                  borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                }}
                >
                  {row.credential}
                </td>
                <td style={{
                  padding: 8,
                  borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                }}
                >
                  <Chip
                    size="small"
                    label={rowConfig.queueChip}
                    color={QUEUE_CHIP_COLOR[rowConfig.queueChip]}
                    icon={rowConfig.queueChip === 'ERROR' ? <Block fontSize="small" /> : stateIcon(rowConfig.severity)}
                    sx={{
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      mr: 1,
                    }}
                  />
                  {rowConfig.errorCode && <Chip size="small" variant="outlined" label={rowConfig.errorCode} />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};

export default CredentialPrevalidationDemo;
