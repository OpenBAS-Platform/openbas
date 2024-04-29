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

export const emptyFilled = (str) => (isNotEmptyField(str) ? str : '-');
