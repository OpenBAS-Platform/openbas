import { ContentCopyOutlined, DownloadingOutlined, TerminalOutlined } from '@mui/icons-material';
import { Alert, Button, Card, CardActionArea, CardContent, Dialog, DialogContent, DialogTitle, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, Tab, Tabs, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Bash, DownloadCircleOutline, Powershell } from 'mdi-material-ui';
import { useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import { fetchExecutors } from '../../../actions/Executor';
import { type ExecutorHelper } from '../../../actions/executors/executor-helper';
import { type MeTokensHelper } from '../../../actions/helper';
import { meTokens } from '../../../actions/User';
import Breadcrumbs from '../../../components/Breadcrumbs';
import Transition from '../../../components/common/Transition';
import ExecutorBanner from '../../../components/ExecutorBanner';
import { useFormatter } from '../../../components/i18n';
import PlatformIcon from '../../../components/PlatformIcon';
import { useHelper } from '../../../store';
import { type Executor } from '../../../utils/api-types';
import { useAppDispatch } from '../../../utils/hooks';
import useAuth from '../../../utils/hooks/useAuth';
import useDataLoader from '../../../utils/hooks/useDataLoader';
import { copyToClipboard, download } from '../../../utils/utils';
import ExecutorDocumentationLink from './ExecutorDocumentationLink';

const useStyles = makeStyles()(() => ({
  card: {
    overflow: 'hidden',
    height: 250,
  },
  area: {
    height: '100%',
    width: '100%',
  },
  content: {
    position: 'relative',
    padding: 0,
    textAlign: 'center',
    height: '100%',
  },
}));

const OPENBAS_CALDERA = 'openbas_caldera';
const OPENBAS_AGENT = 'openbas_agent';
const WINDOWS = 'Windows';

const Executors = () => {
  // Standard hooks
  const theme = useTheme();
  const { t } = useFormatter();
  const [platform, setPlatform] = useState<null | string>(null);
  const [selectedExecutor, setSelectedExecutor] = useState<null | Executor>(null);
  const [agentFolder, setAgentFolder] = useState<null | string>(null);
  const [arch, setArch] = useState<string>('x86_64');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedOption, setSelectedOption] = useState('user');
  const { classes } = useStyles();
  const dispatch = useAppDispatch();

  // Fetching data
  const { settings } = useAuth();
  const { executors, tokens } = useHelper((helper: ExecutorHelper & MeTokensHelper) => ({
    executors: helper.getExecutors(),
    tokens: helper.getMeTokens(),
  }));
  useDataLoader(() => {
    dispatch(fetchExecutors());
    dispatch(meTokens());
  });
  const userToken = tokens.length > 0 ? tokens[0] : undefined;
  const order = {
    openbas_agent: 1,
    openbas_caldera: 2,
    openbas_tanium: 3,
  };
  const sortedExecutors = executors.map((executor: Executor) => ({
    ...executor,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    order: order[executor.executor_type],
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
  })).sort(({ order: a }, { order: b }) => a - b);

  // --
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };
  const openInstall = (executor: Executor) => {
    setSelectedExecutor(executor);
  };
  const closeInstall = () => {
    setPlatform(null);
    setSelectedExecutor(null);
    setActiveTab(0);
    setSelectedOption('user');
    setAgentFolder(null);
    setArch('x86_64');
  };

  // -- Stepper components --
  const buildInstallationUrl = (baseUrl: string) => {
    if (activeTab === 0) return `${baseUrl}/session-user/${userToken?.token_value}`;
    if (activeTab === 1 && selectedOption === 'user') return `${baseUrl}/service-user/${userToken?.token_value}`; // TODO pour savoir quels sont les params a passer user/pwd
    return `${baseUrl}/${userToken?.token_value}`;
  };
  const buildCalderaInstaller = () => {
    switch (platform) {
      case WINDOWS:
        return {
          icon: <Powershell />,
          label: 'powershell',
          defaultAgentFolder: 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera',
          exclusions: `${agentFolder ?? 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera'}
${agentFolder ?? 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera'}\\obas-agent-caldera.exe
MD5: 68c1795fb45cb9b522d6cf48443fdc37
SHA1: 5f87d06f818ff8cba9e11e8cd1c6f9d990eca0f8
SHA256: 6b180913acb8cdac3fb8d3154a2f6a0bed13c056a477f4f94c4679414ec13b9f
SHA512: 6185b7253eedfa6253f26cd85c4bcfaf05195219b6ab06b43d9b07279d7d0cdd3c957bd58d36058d7cde405bc8c5084f3ac060a6080bfc18a843738d3bee87fd`,
          displayedCode: `$server="${settings.executor_caldera_public_url}";
$url="${settings.platform_base_url}/api/implant/caldera/windows/${arch}";
$wc=New-Object System.Net.WebClient;
$data=$wc.DownloadData($url);
get-process | ? {$_.modules.filename -like '${agentFolder ?? 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera'}\\obas-agent-caldera.exe'} | stop-process -f;
rm -force '${agentFolder ?? 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera'}\\obas-agent-caldera.exe' -ea ignore;
New-Item -ItemType Directory -Force -Path '${agentFolder ?? 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera'}' | Out-Null;
[io.file]::WriteAllBytes('${agentFolder ?? 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera'}\\obas-agent-caldera.exe',$data) | Out-Null;
$data=$wc.DownloadData($url + "/ps1");
rm -force 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera\\obas-agent-caldera.ps1' -ea ignore;
[io.file]::WriteAllBytes('C:\\Program Files (x86)\\Filigran\\OBAS Caldera\\obas-agent-caldera.ps1',$data) | Out-Null;
New-NetFirewallRule -DisplayName "Allow OpenBAS" -Direction Inbound -Program '${agentFolder ?? 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera'}\\obas-agent-caldera.exe' -Action Allow | Out-Null;
New-NetFirewallRule -DisplayName "Allow OpenBAS" -Direction Outbound -Program '${agentFolder ?? 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera'}\\obas-agent-caldera.exe' -Action Allow | Out-Null;
Start-Process -FilePath '${agentFolder ?? 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera'}\\obas-agent-caldera.exe' -ArgumentList "-server $server -group red" -WindowStyle hidden;
schtasks /create /tn OpenBASCaldera /sc onlogon /rl highest /tr "Powershell -ExecutionPolicy Bypass -NoProfile -WindowStyle hidden -File 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera\\obas-agent-caldera.ps1' $server";`,
          code: `$server="${settings.executor_caldera_public_url}";$url="${settings.platform_base_url}/api/implant/caldera/windows/${arch}";$wc=New-Object System.Net.WebClient;$data=$wc.DownloadData($url);get-process | ? {$_.modules.filename -like '${agentFolder ?? 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera'}\\obas-agent-caldera.exe'} | stop-process -f;rm -force '${agentFolder ?? 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera'}\\obas-agent-caldera.exe' -ea ignore;New-Item -ItemType Directory -Force -Path '${agentFolder ?? 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera'}' | Out-Null;[io.file]::WriteAllBytes('${agentFolder ?? 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera'}\\obas-agent-caldera.exe',$data) | Out-Null;$data=$wc.DownloadData($url + "/ps1");rm -force 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera\\obas-agent-caldera.ps1' -ea ignore;[io.file]::WriteAllBytes('C:\\Program Files (x86)\\Filigran\\OBAS Caldera\\obas-agent-caldera.ps1',$data) | Out-Null;New-NetFirewallRule -DisplayName "Allow OpenBAS" -Direction Inbound -Program '${agentFolder ?? 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera'}\\obas-agent-caldera.exe' -Action Allow | Out-Null;New-NetFirewallRule -DisplayName "Allow OpenBAS" -Direction Outbound -Program '${agentFolder ?? 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera'}\\obas-agent-caldera.exe' -Action Allow | Out-Null;Start-Process -FilePath '${agentFolder ?? 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera'}\\obas-agent-caldera.exe' -ArgumentList "-server $server -group red" -WindowStyle hidden;schtasks /create /tn OpenBASCaldera /sc onlogon /rl highest /tr "Powershell -ExecutionPolicy Bypass -NoProfile -WindowStyle hidden -File 'C:\\Program Files (x86)\\Filigran\\OBAS Caldera\\obas-agent-caldera.ps1' $server";`,
        };
      case 'Linux':
        return {
          icon: <Bash />,
          label: 'sh',
          defaultAgentFolder: '/opt/openbas-caldera-agent',
          exclusions: `${agentFolder ?? '/opt/openbas-caldera-agent'}
${agentFolder ?? '/opt/openbas-caldera-agent/openbas-caldera-agent'}
MD5: d604c952bb3c6d96621594d39992c499
SHA1: 5b6087f87f5f2ae129f888bba799611836eb39a2
SHA256: 98d1e64445bbef46a36d4724699a386646de78881a1b6f2b346122c76d696c12
SHA512: ca07dc1d0a5297e29327e483f4f35dadb254d96a16a5c33da5ad048e6965a3863d621518a2be40f1a42226c68cbf5e779382a37ee5baa7dd7c538ec73ce059e8`,
          displayedCode: `server="${settings.executor_caldera_public_url}";
mkdir -p ${agentFolder ?? '/opt/openbas-caldera-agent'};
curl -s -X GET ${settings.platform_base_url}/api/implant/caldera/linux/${arch} > ${agentFolder ?? '/opt/openbas-caldera-agent'}/openbas-caldera-agent;
chmod +x ${agentFolder ?? '/opt/openbas-caldera-agent'}/openbas-caldera-agent;
nohup ${agentFolder ?? '/opt/openbas-caldera-agent'}/openbas-caldera-agent -server $server -group red &`,
          code: `server="${settings.executor_caldera_public_url}";mkdir -p ${agentFolder ?? '/opt/openbas-caldera-agent'};curl -s -X GET ${settings.platform_base_url}/api/implant/caldera/linux/${arch} > ${agentFolder ?? '/opt/openbas-caldera-agent'}/openbas-caldera-agent;chmod +x ${agentFolder ?? '/opt/openbas-caldera-agent'}/openbas-caldera-agent;nohup ${agentFolder ?? '/opt/openbas-caldera-agent'}/openbas-caldera-agent -server $server -group red &`,
        };
      case 'MacOS':
        return {
          icon: <TerminalOutlined />,
          label: 'sh',
          defaultAgentFolder: '/opt/openbas',
          exclusions: `${agentFolder ?? '/opt/openbas'}
${agentFolder ?? '/opt/openbas/openbas-caldera-agent'}
MD5: 1132906cc40001f51673108847b88d0c
SHA1: 3177df4a8fa13a2e13ce63670c579955ad55df3f
SHA256: 2b4397160925bf6b9dcca0949073fd9b2fc590ab641ea1d1c3d7d36048ed674a
SHA512: f1c8cf0c41c7d193bcb2aad21d7a739c785902c3231e15986b2eb37f911824a802f50cb2dbb509deba1c7a2a535fb7b34cf100303c61a6087102948628133747`,
          displayedCode: `server="${settings.executor_caldera_public_url}";
mkdir -p ${agentFolder ?? '/opt/openbas'};
curl -s -X GET ${settings.platform_base_url}/api/implant/caldera/macos/${arch} > ${agentFolder ?? '/opt/openbas-caldera-agent'}/openbas-caldera-agent;
chmod +x ${agentFolder ?? '/opt/openbas-caldera-agent'}/openbas-caldera-agent;
nohup ${agentFolder ?? '/opt/openbas-caldera-agent'}/openbas-caldera-agent -server $server -group red &`,
          code: `server="${settings.executor_caldera_public_url}";mkdir -p ${agentFolder ?? '/opt/openbas-caldera-agent'};curl -s -X GET ${settings.platform_base_url}/api/implant/caldera/macos/${arch} > ${agentFolder ?? '/opt/openbas-caldera-agent'}/openbas-caldera-agent;chmod +x ${agentFolder ?? '/opt/openbas-caldera-agent'}/openbas-caldera-agent;nohup ${agentFolder ?? '/opt/openbas-caldera-agent'}/openbas-caldera-agent -server $server -group red &`,
        };
      default:
        return {
          icon: <Bash />,
          label: 'sh',
          defaultAgentFolder: '/opt/openbas-caldera-agent',
          exclusions: `${agentFolder ?? '/opt/openbas-caldera-agent'}
${agentFolder ?? '/opt/openbas-caldera-agent/openbas-caldera-agent'}`,
          displayedCode: `server="${settings.executor_caldera_public_url}";
mkdir -p ${agentFolder ?? '/opt/openbas-caldera-agent'};
curl -s -X GET ${settings.platform_base_url}/api/implant/caldera/linux/${arch} > ${agentFolder ?? '/opt/openbas-caldera-agent'}/openbas-caldera-agent;
chmod +x ${agentFolder ?? '/opt/openbas-caldera-agent'}/openbas-caldera-agent;
nohup ${agentFolder ?? '/opt/openbas-caldera-agent'}/openbas-caldera-agent -server $server -group red &`,
          code: `server="${settings.executor_caldera_public_url}";mkdir -p ${agentFolder ?? '/opt/openbas-caldera-agent'};curl -s -X GET ${settings.platform_base_url}/api/implant/caldera/linux/${arch} > ${agentFolder ?? '/opt/openbas-caldera-agent'}/openbas-caldera-agent;chmod +x ${agentFolder ?? '/opt/openbas-caldera-agent'}/openbas-caldera-agent;nohup ${agentFolder ?? '/opt/openbas-caldera-agent'}/openbas-caldera-agent -server $server -group red &`,
        };
    }
  };
  const buildOpenBASInstaller = () => {
    const buildExtraParams = (advanced: string, standard: string, other: string) => {
      let result = other;
      if (activeTab === 1 && selectedOption === 'user') {
        result = advanced;
      } else if (activeTab === 0) {
        result = standard;
      }
      return result;
    };

    const buildExclusionPath = (advanced: string, standard: string, other: string) => {
      let result = other;
      if (agentFolder) {
        return agentFolder; // If agentFolder is truthy, return it immediately
      }
      if (activeTab === 1 && selectedOption !== 'user') {
        result = advanced;
      } else if (activeTab === 0) {
        result = standard;
      }
      return result;
    };

    switch (platform) {
      case WINDOWS:
        return {
          icon: <Powershell />,
          label: 'powershell',
          exclusions: `${buildExclusionPath('C:\\Program Files (x86)\\Filigran\\OBAS Agent', 'C:\\Filigran', 'C:\\Filigran')}

Caldera injector hashes:
MD5: 68c1795fb45cb9b522d6cf48443fdc37
SHA1: 5f87d06f818ff8cba9e11e8cd1c6f9d990eca0f8
SHA256: 6b180913acb8cdac3fb8d3154a2f6a0bed13c056a477f4f94c4679414ec13b9f
SHA512: 6185b7253eedfa6253f26cd85c4bcfaf05195219b6ab06b43d9b07279d7d0cdd3c957bd58d36058d7cde405bc8c5084f3ac060a6080bfc18a843738d3bee87fd`,
          displayedCode: `iex (iwr ${buildInstallationUrl(settings.platform_base_url + '/api/agent/installer/openbas/windows')}${buildExtraParams('-user USER -pwd PWD TODO', '-privilege PRIVILEGE TODO', '')}).Content`, // todo
          code: `iex (iwr ${buildInstallationUrl(settings.platform_base_url + '/api/agent/installer/openbas/windows')}${buildExtraParams('-user USER -pwd PWD TODO', '-privilege PRIVILEGE TODO', '')}).Content`, // TODO
        };
      case 'Linux':
        return {
          icon: <Bash />,
          label: 'sh',
          exclusions: `${buildExclusionPath('/opt/openbas-agent', '$HOME/.local/openbas-agent-session', '/opt/openbas-agent-service-USER')}
          
Caldera injector hashes:
MD5: d604c952bb3c6d96621594d39992c499
SHA1: 5b6087f87f5f2ae129f888bba799611836eb39a2
SHA256: 98d1e64445bbef46a36d4724699a386646de78881a1b6f2b346122c76d696c12
SHA512: ca07dc1d0a5297e29327e483f4f35dadb254d96a16a5c33da5ad048e6965a3863d621518a2be40f1a42226c68cbf5e779382a37ee5baa7dd7c538ec73ce059e8`,
          displayedCode: `curl -s ${buildInstallationUrl(settings.platform_agent_url + '/api/agent/installer/openbas/linux')} ${buildExtraParams('--user USER --group GROUP | sudo sh', '| sh', '| sudo sh')}`,
          code: `curl -s ${buildInstallationUrl(settings.platform_agent_url + '/api/agent/installer/openbas/linux')} ${buildExtraParams('--user USER --group GROUP | sudo sh', '| sh', '| sudo sh')}`,
        };
      case 'MacOS':
        return {
          icon: <TerminalOutlined />,
          label: 'sh',
          exclusions: `${buildExclusionPath('/opt/openbas-agent', '$HOME/.local/openbas-agent-session', '/opt/openbas-agent-service-USER')}
          
Caldera injector hashes:
MD5: 1132906cc40001f51673108847b88d0c
SHA1: 3177df4a8fa13a2e13ce63670c579955ad55df3f
SHA256: 2b4397160925bf6b9dcca0949073fd9b2fc590ab641ea1d1c3d7d36048ed674a
SHA512: f1c8cf0c41c7d193bcb2aad21d7a739c785902c3231e15986b2eb37f911824a802f50cb2dbb509deba1c7a2a535fb7b34cf100303c61a6087102948628133747`,
          displayedCode: `curl -s ${buildInstallationUrl(settings.platform_agent_url + '/api/agent/installer/openbas/macos')} ${buildExtraParams('--user USER --group GROUP | sudo sh', '| sh', '| sudo sh')}`,
          code: `curl -s ${buildInstallationUrl(settings.platform_agent_url + '/api/agent/installer/openbas/macos')} ${buildExtraParams('--user USER --group GROUP | sudo sh', '| sh', '| sudo sh')}`,
        };
      default:
        return {
          icon: <Bash />,
          label: 'sh',
          exclusions: `${buildExclusionPath('/opt/openbas-agent', '$HOME/.local/openbas-agent-session', '/opt/openbas-agent-service-USER')}

Caldera injector hashes:
MD5: d604c952bb3c6d96621594d39992c499
SHA1: 5b6087f87f5f2ae129f888bba799611836eb39a2
SHA256: 98d1e64445bbef46a36d4724699a386646de78881a1b6f2b346122c76d696c12
SHA512: ca07dc1d0a5297e29327e483f4f35dadb254d96a16a5c33da5ad048e6965a3863d621518a2be40f1a42226c68cbf5e779382a37ee5baa7dd7c538ec73ce059e8`,
          displayedCode: `curl -s ${buildInstallationUrl(settings.platform_agent_url + '/api/agent/installer/openbas/linux')} ${buildExtraParams('--user USER --group GROUP | sudo sh', '| sh', '| sudo sh')}`,
          code: `curl -s ${buildInstallationUrl(settings.platform_agent_url + '/api/agent/installer/openbas/linux')} ${buildExtraParams('--user USER --group GROUP | sudo sh', '| sh', '| sudo sh')}`,
        };
    }
  };
  const ArchitectureFormControl = () => {
    if (platform !== 'MacOS') return null;

    return (
      <FormControl style={{
        width: '100%',
        margin: '20px 0 30px 0',
      }}
      >
        <InputLabel id="arch">{t('Architecture')}</InputLabel>
        <Select
          labelId="arch"
          value={arch}
          onChange={event => setArch(event.target.value ?? 'x86_64')}
          fullWidth
        >
          <MenuItem value="x86_64">{t('x86_64')}</MenuItem>
          <MenuItem value="arm64">{t('arm64')}</MenuItem>
        </Select>
      </FormControl>
    );
  };
  const StepOneInstallation = () => {
    return (
      <Typography variant="h2" style={{ marginTop: theme.spacing(3) }}>
        {t('Step 1 - Install the Agent')}
      </Typography>
    );
  };
  const StepTwoExclusions = () => {
    const exclusions = selectedExecutor?.executor_type === OPENBAS_CALDERA ? buildCalderaInstaller().exclusions : buildOpenBASInstaller().exclusions;
    return (
      <>
        <Typography variant="h2" style={{ marginTop: 20 }}>{t('Step 2 - Add antivirus exclusions')}</Typography>
        <Alert variant="outlined" severity="info">
          {t('The agent will never execute directly any payload.')}
        </Alert>
        <p>
          {t('You will need to add proper antivirus exclusions for this agent (to ensure injects execution to work properly). It may not be necessary in the future but this is generally a good practice to ensure the agent will be always available.')}
        </p>
        <pre style={{ margin: '20px 0 10px 0' }}>{exclusions}</pre>
      </>
    );
  };
  const InstallationScriptsAndActionButtons = () => {
    const fileExtension = platform === WINDOWS ? 'ps1' : 'sh';
    const code = selectedExecutor?.executor_type === OPENBAS_CALDERA ? buildCalderaInstaller().code : buildOpenBASInstaller().code;
    const displayedCode = selectedExecutor?.executor_type === OPENBAS_CALDERA ? buildCalderaInstaller().displayedCode : buildOpenBASInstaller().displayedCode;

    const buildInstallationMessage = () => {
      let message = '';
      if (selectedExecutor?.executor_type === OPENBAS_AGENT) {
        if (activeTab === 0) {
          if (platform === WINDOWS) {
            message = t('You can either directly copy and paste the following Powershell snippet into an standard prompt or download the .ps1 script (make sure to replace the script parameters: TODO).'); // TODO
          } else {
            message = t('You can either directly copy and paste the following bash snippet into a terminal or download the .sh script.');
          }
        } else {
          if (platform === WINDOWS) {
            if (selectedOption === 'user') {
              message = t('You can either directly copy and paste the following PowerShell snippet into an elevated prompt or download the .ps1 script and execute it with administrator privileges (don’t forget to replace the script parameters: TODO).'); // TODO
            } else {
              message = t('You can either directly copy and paste the following PowerShell snippet into an elevated prompt or download the .ps1 script and execute it with administrator privileges.');
            }
          } else {
            if (selectedOption === 'user') {
              message = t('You can either directly copy and paste the following bash snippet into a terminal with root privileges or download the .sh script and run it as root (don’t forget to replace the script parameters: TODO).'); // TODO
            } else {
              message = t('You can either directly copy and paste the following bash snippet into a terminal with root privileges or download the .sh script and run it as root.');
            }
          }
        }
      } else {
        if (platform === WINDOWS) {
          message = t('You can whether directly copy and paste the following Powershell snippet in an elevated prompt or download the .ps1 script (and execute it as an administrator).');
        } else {
          message = t('You can whether directly copy and paste the following bash snippet in a root console or download the .sh script (and execute it as root).');
        }
      }
      return (
        <p>
          {message}
          {' '}
        </p>
      );
    };

    return (
      <>
        {buildInstallationMessage()}
        {selectedExecutor?.executor_type === OPENBAS_CALDERA && platform !== WINDOWS && (
          <Alert variant="outlined" severity="warning">
            {t('For the moment, the following snippet or script will not add the agent at boot. Please be sure to add it in rc.local or other files to make it persistent. We will release proper packages in the near future.')}
          </Alert>
        )}
        <pre style={{ margin: '20px 0 10px 0' }}>{displayedCode}</pre>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
        }}
        >
          <Button
            variant="outlined"
            style={{ marginBottom: theme.spacing(2) }}
            startIcon={<ContentCopyOutlined />}
            onClick={() => copyToClipboard(t, code)}
          >
            {t('Copy')}
          </Button>
          <Button
            variant="outlined"
            style={{ marginBottom: theme.spacing(2) }}
            startIcon={<DownloadCircleOutline />}
            onClick={() => download(displayedCode, `openbas.${fileExtension}`, 'text/plain')}
          >
            {t('Download')}
          </Button>
        </div>
      </>
    );
  };
  const PlatformInstallationForCaldera = () => {
    return (
      <>
        {platform === WINDOWS && (<InstallationScriptsAndActionButtons />)}
        {platform !== WINDOWS && (<InstallationScriptsAndActionButtons />)}
      </>
    );
  };
  const StandardInstallation = () => {
    return (
      <>
        {platform && (
          <>
            <Alert
              variant="outlined"
              severity="info"
              style={{ marginTop: theme.spacing(3) }}
            >
              {t('Quick start with openBAS: Install the agent using your own user account. This installation requires only local standard privileges.')}
            </Alert>
            <StepOneInstallation />
            <Alert
              variant="outlined"
              severity="warning"
            >
              {t('The agent runs in the background as a session. ')
                + t('It will only execute when the user is logged in and the session is active. ')
                + t('The agent can be run as an administrator or a standard user.')}
            </Alert>
            <InstallationScriptsAndActionButtons />
          </>
        )}
      </>
    );
  };
  const AdvancedInstallation = () => {
    return (
      <>
        <Alert
          variant="outlined"
          severity="info"
          style={{ marginTop: theme.spacing(3) }}
        >
          {t('Deploy your agent as a user or a system service. This installation requires local administrator privileges.')}
        </Alert>
        <StepOneInstallation />
        <div>
          <RadioGroup
            value={selectedOption}
            onChange={handleOptionChange}
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '20px',
            }}
          >
            <FormControlLabel value="user" control={<Radio />} label={t('Install Agent as User')} />
            <FormControlLabel value="system" control={<Radio />} label={t('Install Agent as System')} />
          </RadioGroup>
        </div>
        {platform && (
          <>
            <Alert variant="outlined" severity="warning" style={{ marginTop: theme.spacing(1) }}>
              {selectedOption === 'user' ? (
                <>
                  {t(`The agent runs in the background as a service and automatically starts when the machine powers on.`)
                    + t(`It can be run as administrator or as a standard user depending on the user rights used in the script parameters.`)}
                  {platform === WINDOWS && (
                    <>
                      {' '}
                      {t('Installing as a user requires specific permissions: You should add "Log on as a service" policy.')}
                      {' '}
                    </>
                  )}
                </>
              ) : (
                t(`The agent runs in the background as a service and automatically starts when the machine powers on.`)
                + t(`Installing it as a system grants system-wide privileges.`)
              )}
            </Alert>
            <InstallationScriptsAndActionButtons />
          </>
        )}
      </>
    );
  };

  return (
    <>
      <Breadcrumbs
        variant="list"
        elements={[{
          label: t('Agents'),
          current: true,
        }]}
      />
      <Alert variant="outlined" severity="info" style={{ marginBottom: theme.spacing(2) }}>
        {t('Here, you can download and install simulation agents available in your executors. Depending on the integrations you have enabled, some of them may be unavailable.')}
        <br />
        <br />
        {t('Learn more information about how to setup simulation agents')}
        {' '}
        <a href="https://docs.openbas.io" target="_blank" rel="noreferrer">{t('in the documentation')}</a>
        .
      </Alert>
      <Grid container spacing={3}>
        {sortedExecutors.map((executor: Executor) => {
          const platforms = executor.executor_platforms || [];
          return (
            <Grid item xs={3} key={executor.executor_id}>
              <Card classes={{ root: classes.card }} variant="outlined">
                <CardActionArea
                  classes={{ root: classes.area }}
                  onClick={() => openInstall(executor)}
                  disabled={platforms.length === 0}
                >
                  <CardContent classes={{ root: classes.content }}>
                    <ExecutorBanner executor={executor.executor_type} label={executor.executor_name} height={150} />
                    <div>
                      <Typography
                        variant="h6"
                        style={{
                          fontSize: 15,
                          padding: '10px 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: platforms.length === 0 ? theme.palette.text?.disabled : theme.palette.text?.primary,
                        }}
                      >
                        {t(`Install ${executor.executor_name}`)}
                      </Typography>
                      <div
                        style={{
                          position: 'absolute',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {platforms.map(platform => (
                          <div
                            key={platform}
                            style={{
                              margin: '0 5px',
                              padding: '5px',
                              border: '1px solid',
                              borderRadius: '4px',
                              borderColor: '#292D39',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <PlatformIcon platform={platform} width={20} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <Dialog
        open={selectedExecutor !== null && platform === null}
        TransitionComponent={Transition}
        onClose={closeInstall}
        slotProps={{ paper: { elevation: 1 } }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle style={{ padding: '40px 40px 30px' }}>
          {selectedExecutor?.executor_name}
          {' '}
          {t('Installation')}
        </DialogTitle>
        <DialogContent>
          <Typography
            style={{
              fontSize: 15,
              padding: '10px 18px',
              marginBottom: theme.spacing(4),
            }}
          >
            {t('Choose your platform')}
          </Typography>
          <Grid container spacing={1}>
            {selectedExecutor?.executor_platforms
              && selectedExecutor?.executor_platforms.map(platform => (
                <Grid item xs={4} key={platform}>
                  <Card
                    variant="outlined"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '300px',
                      margin: '0 15px 80px',
                    }}
                  >
                    <CardActionArea onClick={() => setPlatform(platform)} classes={{ root: classes.area }}>
                      <CardContent>
                        <div
                          key={platform}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <PlatformIcon platform={platform} width={30} />
                        </div>
                        <Typography
                          style={{
                            fontSize: 15,
                            padding: '15px 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <DownloadingOutlined style={{ marginRight: theme.spacing(1) }} />
                          {t(`Install ${platform} agent`)}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </DialogContent>
      </Dialog>
      <Dialog
        open={selectedExecutor !== null && platform !== null}
        TransitionComponent={Transition}
        onClose={closeInstall}
        fullWidth
        maxWidth="md"
        slotProps={{ paper: { elevation: 1 } }}
      >
        <DialogTitle><Typography variant="h6" style={{ padding: '20px 20px 0' }}>{t(`Installation ${selectedExecutor?.executor_name} - ${platform}`)}</Typography></DialogTitle>
        <DialogContent>
          {selectedExecutor && (
            <div style={{ padding: '0 20px 20px' }}>
              {/* Caldera */}
              {selectedExecutor.executor_type === OPENBAS_CALDERA && (
                <div>
                  <ArchitectureFormControl />
                  <StepOneInstallation />
                  <Alert variant="outlined" severity="info">
                    {t('Installing the agent is requiring local administrator privileges.')}
                  </Alert>
                  <PlatformInstallationForCaldera />
                  <StepTwoExclusions />
                </div>
              )}

              {/* OBAS */}
              {selectedExecutor && selectedExecutor.executor_type === OPENBAS_AGENT && (
                <div>
                  <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                    <Tab label={t('Standard Installation')} />
                    <Tab label={t('Advanced Installation')} />
                  </Tabs>
                  {activeTab === 0 && (<StandardInstallation />)}
                  {activeTab === 1 && (<AdvancedInstallation />)}
                  <StepTwoExclusions />
                </div>
              )}

              {/* Others */}
              <ExecutorDocumentationLink executor={selectedExecutor} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Executors;
