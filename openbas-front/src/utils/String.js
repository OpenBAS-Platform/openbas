import { Link as MUILink, Tooltip, Typography } from '@mui/material';
import { Link } from 'react-router';

import colorStyles from '../components/Color';
import { isNotEmptyField } from './utils';

export const truncate = (str, limit) => {
  if (str === undefined || str === null || str.length <= limit) {
    return str;
  }
  const trimmedStr = str.substr(0, limit);
  if (!trimmedStr.includes(' ')) {
    return `${trimmedStr}...`;
  }
  return `${trimmedStr.substr(
    0,
    Math.min(trimmedStr.length, trimmedStr.lastIndexOf(' ')),
  )}...`;
};

export const resolveUserName = (user) => {
  if (user.user_firstname && user.user_lastname) {
    return `${user.user_firstname} ${user.user_lastname}`;
  }
  return user.user_email;
};

export const resolveUserNames = (users, withEmailAddress = false) => {
  return users
    .map((user) => {
      if (user.user_firstname && user.user_lastname) {
        return `${user.user_firstname} ${user.user_lastname}${
          withEmailAddress ? ` (${user.user_email})` : ''
        }`;
      }
      return user.user_email;
    })
    .join(', ');
};

export const emptyFilled = str => (isNotEmptyField(str) ? str : '-');

// Extract the first two items as visible chips
export const getVisibleItems = (items, limit) => {
  return items?.slice(0, limit);
};

// Generate label with name of remaining items
export const getLabelOfRemainingItems = (items, start, property) => {
  return items?.slice(start, items?.length).map(
    item => item[property],
  ).join(', ');
};

// Calculate the number of remaining items
export const getRemainingItemsCount = (items, visibleItems) => {
  return (items && visibleItems && items.length - visibleItems.length) || null;
};

// Compute label for status
export const computeLabel = (status) => {
  if (status === 'PENDING') {
    return 'Pending validation';
  }
  if (status === 'SUCCESS') {
    return 'Success';
  }
  if (status === 'PARTIAL') {
    return 'Partial';
  }
  return 'Failed';
};

export const capitalize = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// compute color for status
export const computeColorStyle = (status) => {
  if (status === 'PENDING') {
    return colorStyles.blueGrey;
  }
  if (status === 'SUCCESS') {
    return colorStyles.green;
  }
  if (status === 'PARTIAL') {
    return colorStyles.orange;
  }
  return colorStyles.red;
};

export const formatMacAddress = (mac) => {
  const address = mac.toUpperCase();
  return address.match(/.{1,2}/g)?.join(':') || '-';
};

export const formatIp = (ip) => {
  return ip.toUpperCase();
};

export const INJECT = 'inject';
export const SIMULATION = 'simulation';
export const SCENARIO = 'scenario';
export const ATOMIC_BASE_URL = '/admin/atomic_testings';
export const SIMULATION_BASE_URL = '/admin/simulations';
export const SCENARIO_BASE_URL = '/admin/scenarios';

const renderLink = (title, url) => (
  <Tooltip title={title}>
    <MUILink
      component={Link}
      to={url}
      underline="hover"
      sx={{
        display: 'inline-block',
        maxWidth: 200,
      }}
    >
      <Typography variant="body2" noWrap>
        {truncate(title, 30)}
      </Typography>
    </MUILink>
  </Tooltip>
);

export const renderReference = (finding, type) => {
  switch (type) {
    case INJECT: {
      const title = finding.finding_inject?.inject_title;
      const injectId = finding.finding_inject?.inject_id;
      const simulationId = finding.finding_simulation?.exercise_id;

      if (!title || !injectId) return '-';
      const isAtomic = !simulationId;
      const url = isAtomic
        ? `${ATOMIC_BASE_URL}/${injectId}`
        : `${SIMULATION_BASE_URL}/${simulationId}/injects/${injectId}`;

      return renderLink(title, url);
    }

    case SIMULATION: {
      const title = finding.finding_simulation?.exercise_name;
      const id = finding.finding_simulation?.exercise_id;
      if (!title || !id) return '-';
      return renderLink(title, `${SIMULATION_BASE_URL}/${id}`);
    }

    case SCENARIO: {
      const title = finding.finding_scenario?.scenario_name;
      const id = finding.finding_scenario?.scenario_id;
      if (!title || !id) return '-';
      return renderLink(title, `${SCENARIO_BASE_URL}/${id}`);
    }

    default:
      return '-';
  }
};
