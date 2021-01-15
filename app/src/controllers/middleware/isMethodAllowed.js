import config from "../../config/config";

export default (module, method, permission) => {
    if (!module || !method)
      return { error: true, message: "no Module or Method specified" };
  
    const matomoConfig = config.matomo;
  
    const allowModule = Array.isArray(matomoConfig?.enabledModules?.module)
      ? matomoConfig.enabledModules.module.find(
          (elem) => elem.name.toLowerCase() === module.toLowerCase()
        )
      : false;
  
    if (!allowModule) return { error: true, message: "Module not allowed" };

    const allowMethod = Array.isArray(allowModule?.methods)
      ? allowModule?.methods.find((elem) => {
          const elemMethod = elem.split("|");
  
          return elemMethod[0].toLowerCase() === method.toLowerCase();
        })
      : false;

    if (!allowMethod)
      return { error: true, message: "Method not allowed" };
  
    const getPermission = allowMethod ? allowMethod.split("|") : [];
  
    const isAllowedPermission = permission.includes(getPermission[1]);
  
    if (!isAllowedPermission)
      return {
        error: true,
        message: "Not enough permission to access the method: " + method,
      };
  
    return { error: false };
  }