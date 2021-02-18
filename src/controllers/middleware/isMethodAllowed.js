import config from "../../config/config";

export default (queryModule, QueryMethod, permission) => {
  let error = {
    error: true,
    message: "",
  };

  if (!module[0] || !method[0]) {
    error.message = 'no "module" or "method" specified';
    return error;
  }

  const matomoConfig = config.matomo;

  if (matomoConfig?.enabled && Object.keys(matomoConfig.enabled).length > 0) {
    error.message = 'no allowed "module" was found in the configuration file';
    return error;
  }

  for (const module of queryModule) {
    const moduleKey = Object.keys(matomoConfig.enabled).find(
      (elem) => elem.toLowerCase() === module.toLowerCase()
    );
    const moduleList = matomoConfig.enabled[moduleKey];

    if (moduleList && Array.isArray(moduleList)) {
      for (const method of QueryMethod) {
        const methodKey = Object.keys(moduleList).find(
          (elem) => elem.toLowerCase() === method.toLowerCase()
        );

        if (moduleList[methodKey] && moduleList[methodKey] === permission) {
          error.error = false;
        } else {
          error.message = `Can't access method "${elem}"`;
          break;
        }
      }
    } else {
      error.message = `Module "${elem}" not allowed`;
      break;
    }
  }

  if (error.error) {
    return error;
  }

  return { error: false };
};
