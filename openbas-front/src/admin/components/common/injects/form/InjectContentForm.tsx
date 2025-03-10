import { Typography } from '@mui/material';

import { useFormatter } from '../../../../../components/i18n';

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
  const injectContentParts = [
    { title: t('Targeted teams') },
    { title: t('Inject data') },
  ];

  const renderContentPart = (title: string) => {
    return (
      <>
        <Typography variant="h5" style={{ fontWeight: 500 }}>{title}</Typography>
        <div></div>
      </>
    );
  };
  return (
    <>
      {injectContentParts.map(part => renderContentPart(part.title))}
    </>
  );
};

export default InjectContentForm;
