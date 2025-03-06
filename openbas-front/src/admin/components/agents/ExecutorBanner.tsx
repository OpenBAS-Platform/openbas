import { type FunctionComponent } from 'react';

import calderaLogo from '../../../static/images/executors/logo_caldera.png';
import crowdstrikeLogo from '../../../static/images/executors/logo_crowdstrike.png';
import openBasLogo from '../../../static/images/executors/logo_openbas.png';
import taniumLogo from '../../../static/images/executors/logo_tanium.png';
import unknownDark from '../../../static/images/platforms/unknown-dark.png';

interface ExecutorBannerProps {
  executor: string;
  label: string;
  height?: number;
}

const executorBanners: Record<string, {
  img: string;
  backgroundColor: string;
}> = {
  openbas_agent: {
    img: openBasLogo,
    backgroundColor: '#001BDB',
  },
  openbas_crowdstrike: {
    img: crowdstrikeLogo,
    backgroundColor: '#E12E37',
  },
  openbas_tanium: {
    img: taniumLogo,
    backgroundColor: '#E03E41',
  },
  openbas_caldera: {
    img: calderaLogo,
    backgroundColor: '#8B1316',
  },
  Unknown: {
    img: unknownDark,
    backgroundColor: '#b6b7b7',
  },
};

const ExecutorBanner: FunctionComponent<ExecutorBannerProps> = ({ executor, label, height }) => {
  const executorData = executorBanners[executor] || executorBanners.Unknown;
  return (
    <div
      style={{
        backgroundColor: executorData.backgroundColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: height,
        overflow: 'hidden',
        position: 'relative',
        padding: 0,
      }}
    >
      <img
        src={executorData.img}
        alt={label}
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
};

export default ExecutorBanner;
