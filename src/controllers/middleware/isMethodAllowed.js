import config from '../../config/config';
import messages from '../../utils/messages';

export default (queryModule, queryMethod, permission) => {
  const error = {
    error: true,
    status: 403,
    message: messages.errors.forbidden,
  };

  if (!queryModule || !queryMethod) {
    error.message = messages.errors.malformedParameters;
    return error;
  }

  const matomoConfig = config.matomo;

  const moduleKey = Object.keys(matomoConfig.enabled).find(
    elem => elem.toLowerCase() === queryModule.toLowerCase(),
  );
  const modulesList = matomoConfig.enabled[moduleKey];

  if (!modulesList) {
    error.error = true;

    return error;
  }

  const methodKey = Object.keys(modulesList).find(
    elem => elem.toLowerCase() === queryMethod.toLowerCase(),
  );

  if (!modulesList[methodKey]) {
    error.error = true;

    return error;
  }

  if (modulesList[methodKey] === permission || permission === 'admin' || permission === 'RW') {
    error.error = false;
  } else {
    error.error = true;
  }

  return error;
};
