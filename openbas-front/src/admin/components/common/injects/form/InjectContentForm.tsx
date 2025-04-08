import { List, Typography } from '@mui/material';

import { useFormatter } from '../../../../../components/i18n';
import InjectAddTeams from '../InjectAddTeams';
import InjectTeamsList from '../teams/InjectTeamsList';

// teams
// assets
// assetGroups
// articles
// challenges
// dynamic fields
// expectations
// documents

// variablesDialogs

const InjectContentForm = () => {
  const { t } = useFormatter();

  const renderContentPart = (title: string) => {
    return (
      <>
        <Typography variant="h5" style={{ fontWeight: 500 }}>{title}</Typography>
        <div></div>
      </>
    );
  };

  const renderTargetedTeams = () => {
    return (
      <InjectTeamsList />
    );
  };

  const injectContentParts = [
    {
      title: t('Targeted teams'),
      rightButton: <div>All teams</div>,
      render: renderTargetedTeams,
    },
    { title: t('Targeted assets') },
    { title: t('Targeted assets groups') },
    { title: t('Media pressure to publish') },
    { title: t('Challenges to publish') },
  ];

  return (
    <>
      {injectContentParts.map((part) => {
        return (
          <>
            <Typography variant="h5" style={{ fontWeight: 500 }}>{part.title}</Typography>
            {part.render ? part.render() : null}
          </>
        );
      })}
    </>
  );
};

export default InjectContentForm;
