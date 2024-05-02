import React, { useState } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { Alert, Button, Card, CardActionArea, CardContent, Chip, Dialog, DialogContent, DialogTitle, Grid, Tab, Tabs, TextField, Typography } from '@mui/material';
import { ArticleOutlined, ContentCopyOutlined, DownloadingOutlined, TerminalOutlined } from '@mui/icons-material';
import { Bash, Powershell } from 'mdi-material-ui';
import { useFormatter } from '../../../components/i18n';
import { useHelper } from '../../../store';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useAppDispatch } from '../../../utils/hooks';
import type { Injector } from '../../../utils/api-types';
import type { InjectorHelper } from '../../../actions/injectors/injector-helper';
import { fetchInjectors } from '../../../actions/Injectors';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import type { Theme } from '../../../components/Theme';
import Breadcrumbs from '../../../components/Breadcrumbs';
import Transition from '../../../components/common/Transition';
import { copyToClipboard } from '../../../utils/utils';
import useAuth from '../../../utils/hooks/useAuth';
import PlatformIcon from '../../../components/PlatformIcon';

const useStyles = makeStyles(() => ({
  card: {
    overflow: 'hidden',
    height: 250,
  },
  area: {
    width: '100%',
    height: '100%',
  },
  content: {
    position: 'relative',
    padding: 20,
    textAlign: 'center',
  },
  icon: {
    padding: 0,
  },
  chip: {
    height: 30,
    fontSize: 12,
    borderRadius: 4,
    marginBottom: 10,
  },
}));

const Injectors = () => {
  // Standard hooks
  const theme = useTheme<Theme>();
  const { t } = useFormatter();
  const [platform, setPlatform] = useState<null | string>(null);
  const [selectedInjectors, setSelectedInjectors] = useState<null | Injector[]>(null);
  const [activeTab, setActiveTab] = useState<null | string>(null);
  const [implantName, setImplantName] = useState('splunkd');
  const classes = useStyles();
  const dispatch = useAppDispatch();

  // Filter and sort hook
  const searchColumns = ['name', 'description'];
  const filtering = useSearchAnFilter(
    'injector',
    'name',
    searchColumns,
  );

  // Fetching data
  const { settings } = useAuth();
  const { injectors } = useHelper((helper: InjectorHelper) => ({
    injectors: helper.getInjectors(),
  }));
  useDataLoader(() => {
    dispatch(fetchInjectors());
  });
  const sortedInjectors = filtering.filterAndSort(injectors);
  const windowsInjectors = sortedInjectors.filter((injector: Injector) => injector.injector_simulation_agent_platforms?.includes('Windows'));
  const linuxInjectors = sortedInjectors.filter((injector: Injector) => injector.injector_simulation_agent_platforms?.includes('Linux'));
  const macOsInjectors = sortedInjectors.filter((injector: Injector) => injector.injector_simulation_agent_platforms?.includes('MacOS'));
  const browserInjectors = sortedInjectors.filter((injector: Injector) => injector.injector_simulation_agent_platforms?.some((n) => ['Chrome', 'Firefox', 'Edge', 'Safari'].includes(n)));

  // Selection
  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };
  const openInstall = (selectedPlatform: string, openInjectors: Injector[]) => {
    setPlatform(selectedPlatform);
    setSelectedInjectors(openInjectors);
    setActiveTab((openInjectors ?? []).at(0)?.injector_type ?? null);
  };
  const closeInstall = () => {
    setPlatform(null);
    setSelectedInjectors(null);
    setActiveTab(null);
    setImplantName('splunkd');
  };
  const currentSelectedInjector = (selectedInjectors ?? []).filter((injector) => injector.injector_type === activeTab).at(0);
  const platformSelector = () => {
    switch (platform) {
      case 'windows':
        return {
          icon: <Powershell />,
          label: 'powershell',
          displayedCode: `$server="${settings.caldera_public_url}";
$url="$server/file/download";
$wc=New-Object System.Net.WebClient;
$wc.Headers.add("pl7atform","windows");
$wc.Headers.add("file","sandcat.go");
$data=$wc.DownloadData($url);
get-process | ? {$_.modules.filename -like "C:\\Users\\Public\\${implantName}.exe"} | stop-process -f;
rm -force "C:\\Users\\Public\\${implantName}.exe" -ea ignore;
[io.file]::WriteAllBytes("C:\\Users\\Public\\${implantName}.exe",$data) | Out-Null;
Start-Process -FilePath C:\\Users\\Public\\${implantName}.exe -ArgumentList "-server $server -group red" -WindowStyle hidden;`,
          code: `$server="${settings.caldera_public_url}";$url="$server/file/download";$wc=New-Object System.Net.WebClient;$wc.Headers.add("platform","windows");$wc.Headers.add("file","sandcat.go");$data=$wc.DownloadData($url);get-process | ? {$_.modules.filename -like "C:\\Users\\Public\\${implantName}.exe"} | stop-process -f;rm -force "C:\\Users\\Public\\${implantName}.exe" -ea ignore;[io.file]::WriteAllBytes("C:\\Users\\Public\\${implantName}.exe",$data) | Out-Null;Start-Process -FilePath C:\\Users\\Public\\${implantName}.exe -ArgumentList "-server $server -group red" -WindowStyle hidden;`,
        };
      case 'linux':
        return {
          icon: <Bash />,
          label: 'sh',
          displayedCode: `server="${settings.caldera_public_url}";
curl -s -X POST -H "file:sandcat.go" -H "platform:linux" $server/file/download > ${implantName};
chmod +x ${implantName};
./${implantName} -server $server -group red -v`,
          code: `server="${settings.caldera_public_url}";curl -s -X POST -H "file:sandcat.go" -H "platform:linux" $server/file/download > ${implantName};chmod +x ${implantName};./${implantName} -server $server -group red -v`,
        };
      case 'macos':
        return {
          icon: <TerminalOutlined />,
          label: 'sh',
          displayedCode: `server="${settings.caldera_public_url}";
curl -s -X POST -H "file:sandcat.go" -H "platform:darwin" -H "architecture:amd64" $server/file/download > ${implantName};
chmod +x ${implantName};
./${implantName} -server $server -v`,
          code: `server="${settings.caldera_public_url}";curl -s -X POST -H "file:sandcat.go" -H "platform:darwin" -H "architecture:amd64" $server/file/download > ${implantName};chmod +x ${implantName};./${implantName} -server $server -v`,
        };
      default:
        return {
          icon: <TerminalOutlined />,
          label: 'sh',
          displayedCode: `server="${settings.caldera_public_url}";
curl -s -X POST -H "file:sandcat.go" -H "platform:linux" $server/file/download > ${implantName};
chmod +x ${implantName};
./${implantName} -server $server -group red -v`,
          code: `server="${settings.caldera_public_url}";curl -s -X POST -H "file:sandcat.go" -H "platform:linux" $server/file/download > ${implantName};chmod +x ${implantName};./${implantName} -server $server -group red -v`,
        };
    }
  };
  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Agents'), current: true }]} />
      <Alert variant="outlined" severity="info" style={{ marginBottom: 30 }}>
        {t('Here, you can download and install simulation agents available in your injectors. Depending on the integrations you have enabled, some of them may be unavailable.')}<br /><br />
        {t('Learn more information about how to setup simulation agents')} <a href="https://docs.openbas.io">{t('in the documentation')}</a>.
      </Alert>
      <Grid container={true} spacing={3}>
        <Grid item={true} xs={3}>
          <Card classes={{ root: classes.card }} variant="outlined">
            <CardActionArea classes={{ root: classes.area }} onClick={() => openInstall('windows', windowsInjectors)} disabled={windowsInjectors.length === 0}>
              <CardContent className={classes.content}>
                <div className={classes.icon}>
                  <PlatformIcon platform='Windows' width={40} />
                </div>
                <Typography
                  variant="h6"
                  style={{
                    fontSize: 15,
                    margin: '20px 0 40px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: windowsInjectors.length === 0 ? theme.palette.text?.disabled : theme.palette.text?.primary,
                  }}
                >
                  <DownloadingOutlined style={{ marginRight: 10 }} /> Install Windows Agent
                </Typography>
                <div style={{ position: 'absolute', width: '100%', right: 0, bottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {windowsInjectors.map((injector: Injector) => {
                    return (
                      <img
                        key={injector.injector_id}
                        src={`/api/images/injectors/${injector.injector_type}`}
                        alt={injector.injector_type}
                        style={{ width: 30, height: 30, borderRadius: 4, margin: '0 10px 0 10px' }}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item={true} xs={3}>
          <Card classes={{ root: classes.card }} variant="outlined">
            <CardActionArea classes={{ root: classes.area }} onClick={() => openInstall('linux', linuxInjectors)} disabled={linuxInjectors.length === 0}>
              <CardContent className={classes.content}>
                <div className={classes.icon}>
                  <PlatformIcon platform="Linux" width={40} />
                </div>
                <Typography
                  variant="h6"
                  style={{
                    fontSize: 15,
                    margin: '20px 0 40px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: linuxInjectors.length === 0 ? theme.palette.text?.disabled : theme.palette.text?.primary,
                  }}
                >
                  <DownloadingOutlined style={{ marginRight: 10 }} /> Install Linux Agent
                </Typography>
                <div style={{ position: 'absolute', width: '100%', right: 0, bottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {linuxInjectors.map((injector: Injector) => {
                    return (
                      <img
                        key={injector.injector_id}
                        src={`/api/images/injectors/${injector.injector_type}`}
                        alt={injector.injector_type}
                        style={{ width: 30, height: 30, borderRadius: 4, margin: '0 10px 0 10px' }}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item={true} xs={3}>
          <Card classes={{ root: classes.card }} variant="outlined">
            <CardActionArea classes={{ root: classes.area }} onClick={() => openInstall('macos', macOsInjectors)} disabled={macOsInjectors.length === 0}>
              <CardContent className={classes.content}>
                <div className={classes.icon}>
                  <PlatformIcon platform="MacOS" width={40} />
                </div>
                <Typography
                  variant="h6"
                  style={{
                    fontSize: 15,
                    margin: '20px 0 40px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: macOsInjectors.length === 0 ? theme.palette.text?.disabled : theme.palette.text?.primary,
                  }}
                >
                  <DownloadingOutlined style={{ marginRight: 10 }} /> Install MacOS Agent
                </Typography>
                <div style={{ position: 'absolute', width: '100%', right: 0, bottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {macOsInjectors.map((injector: Injector) => {
                    return (
                      <img
                        key={injector.injector_id}
                        src={`/api/images/injectors/${injector.injector_type}`}
                        alt={injector.injector_type}
                        style={{ width: 30, height: 30, borderRadius: 4, margin: '0 10px 0 10px' }}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item={true} xs={3}>
          <Card classes={{ root: classes.card }} variant="outlined">
            <CardActionArea classes={{ root: classes.area }} onClick={() => openInstall('browser', browserInjectors)} disabled={browserInjectors.length === 0}>
              <CardContent className={classes.content}>
                <div className={classes.icon}>
                  <PlatformIcon platform="Browser" width={40} />
                </div>
                <Typography
                  variant="h6"
                  style={{
                    fontSize: 15,
                    margin: '20px 0 40px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: browserInjectors.length === 0 ? theme.palette.text?.disabled : theme.palette.text?.primary,
                  }}
                >
                  <DownloadingOutlined style={{ marginRight: 10 }} /> Install Browser Agent
                </Typography>
                <div style={{ position: 'absolute', width: '100%', right: 0, bottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {browserInjectors.map((injector: Injector) => {
                    return (
                      <img
                        key={injector.injector_id}
                        src={`/api/images/injectors/${injector.injector_type}`}
                        alt={injector.injector_type}
                        style={{ width: 30, height: 30, borderRadius: 4, margin: '0 10px 0 10px' }}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
      <Dialog
        open={platform !== null}
        TransitionComponent={Transition}
        onClose={closeInstall}
        PaperProps={{ elevation: 1 }}
        fullWidth={true}
        maxWidth="md"
      >
        <DialogTitle>Install a simulation agent</DialogTitle>
        <DialogContent>
          <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
            {(selectedInjectors ?? []).map((injector) => {
              return (
                <Tab key={injector.injector_id} label={injector.injector_name} value={injector.injector_type}/>
              );
            })}
          </Tabs>
          {currentSelectedInjector && (
          <div style={{ marginTop: 20 }}>
            <Alert variant="outlined" severity="info">
              Installation instruction for the {currentSelectedInjector.injector_name} simulation agents.
            </Alert>
            {currentSelectedInjector.injector_name === 'Caldera' ? (
              <div style={{ marginTop: 20 }}>
                <Chip
                  variant="outlined"
                  icon={platformSelector().icon}
                  classes={{ root: classes.chip }}
                  label={platformSelector().label}
                />
                <TextField
                  label={t('Implant name')}
                  fullWidth={true}
                  value={implantName}
                  onChange={(event) => setImplantName(event.target.value)}
                  style={{ marginTop: 10 }}
                />
                <pre style={{ marginBottom: 10 }}><code>{platformSelector().displayedCode}</code></pre>
                <Button variant="outlined" style={{ width: '100%', marginBottom: 20 }} startIcon={<ContentCopyOutlined />} onClick={() => copyToClipboard(t, platformSelector().code)}>{t('Copy')}</Button>
              </div>
            ) : (
              <div style={{ marginTop: 20 }}>
                <Chip
                  variant="outlined"
                  icon={<ArticleOutlined />}
                  classes={{ root: classes.chip }}
                  label={t('documentation')}
                />
                <Typography variant="body1" style={{ marginBottom: 20 }}>
                  To install the agent please follow the <a target="_blank" href={currentSelectedInjector.injector_simulation_agent_doc} rel="noreferrer">{currentSelectedInjector.injector_name} documentation</a>.
                </Typography>
              </div>
            )}
          </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Injectors;
