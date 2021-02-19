import config from '../../config/config';

export default (queryModule, queryMethod, permission) => {
  const error = {
    error: true,
    message: '',
  };

  if (!queryModule[0] || !queryMethod[0]) {
    error.message = 'no "module" or "method" specified';
    return error;
  }

  const matomoConfig = config.matomo;

  if (!matomoConfig?.enabled || Object.keys(matomoConfig.enabled).length < 1) {
    error.message = "no allowed 'module' was found in the configuration file";
    return error;
  }
  // eslint-disable-next-line
  for (const module of queryModule) {
    const moduleKey = Object.keys(matomoConfig.enabled).find(
      (elem) => elem.toLowerCase() === module.toLowerCase(),
    );
    const moduleList = matomoConfig.enabled[moduleKey];

    if (moduleList) {
      // eslint-disable-next-line
      for (const method of queryMethod) {
        const methodKey = Object.keys(moduleList).find(
          (elem) => elem.toLowerCase() === method.toLowerCase(),
        );

        if (!moduleList[methodKey]) {
          error.error = true;
          error.message = `Can't access method '${method}'`;
          break;
        }

        if (moduleList[methodKey] === permission || permission === 'admin' || permission === 'RW') {
          error.error = false;
        } else {
          error.error = true;
          error.message = `Not allowed to access method '${method}' with the current permission settings`;
          break;
        }
      }
      if (error.error) break;
    } else {
      error.error = true;
      error.message = `Module '${module}' not allowed`;
      break;
    }
  }

  if (error.error) {
    return error;
  }

  return { error: false };
};
