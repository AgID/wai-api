import apiCall from "../services/apiCall";
import config from "../config/config";

const isUserAllowed = (headers, idSite) => {
  if (isNaN(idSite)) return { error: false, permission: false };
  const consumerCustomId = headers["x-consumer-custom-id"];
  if (typeof consumerCustomId === "string") {
    let customId;
    let idList;
    let permissionList;

    try {
      customId = JSON.parse(headers["x-consumer-custom-id"]);
      idList = Array.isArray(customId.siteId)
        ? [...customId].siteId.map((elem) => elem.id)
        : undefined;
      permissionList = Array.isArray(customId.siteId)
        ? [...customId].siteId.map((elem) => elem.permission)
        : undefined;
    } catch (error) {
      console.log("Error parsing json", error);
    }
    console.log(customId, Array.isArray(customId), idSite);
    if (Array.isArray(idList) && idList.includes(idSite)) {
      return { error: false, permission: permissionList };
    }
  }
  return { error: true, message: "Not Allowed" };
};

const isMethodAllowed = (module, method, permission) => {
  if (!module || !method)
    return { error: true, message: "no Module or Method specified" };

  const matomoConfig = config.matomo;

  const allowModule = Array.isArray(matomoConfig?.enabledModules?.module)
    ? matomoConfig.enabledModules.module.find(
        (elem) => elem.name.toLowerCase() === module.toLowerCase()
      )
    : false;

  if (!allowModule) return { error: true, message: "Module not allowed" };
  console.log("permission", permission);
  const allowMethod = Array.isArray(allowModule?.methods)
    ? allowModule?.methods.find((elem) => {
        const elemMethod = elem.split("|");
        const isAllowedMethod =
          elemMethod[0].toLowerCase() === method.toLowerCase();
        const isAllowedPermission =
          permission === false || permission.includes(elemMethod[1]);
        console.log(elemMethod, elemMethod[0], elemMethod[1], permission);
        return isAllowedMethod && isAllowedPermission;
      })
    : false;

  if (!allowMethod) return { error: true, message: "Method not allowed" };

  return { error: false };
};

export default async (req, res) => {
  const isModulePublic = Array.isArray(config.matomo?.publicMethods)
    ? config.matomo.publicMethods.find(
        (elem) => elem.toLowerCase() === req.query?.method.toLowerCase()
      )
    : false;
  
  if (!isModulePublic) {
    const isAllowedUser = isUserAllowed(
      req.headers,
      parseInt(req.query?.idSite)
    );

    if (isAllowedUser.error === true)
      return res.status(403).json({ error: isAllowedUser.message });

    const isAllowedMethod = isMethodAllowed(
      req.query?.module,
      req.query?.method,
      isAllowedUser.permission
    );

    if (isAllowedMethod.error === true)
      return res.status(403).json({ error: isAllowedMethod.message });
  }

  const params = req.originalUrl;

  const method = req.method;
  const url = process.env.ANALYTICS_PUBLIC_URL + encodeURI(params);

  const results = await apiCall({ method: method, url: url, data: {} });
  if (results.error)
    return res.status(results?.status || 200).json({ error: results.message });

  return res.status(200).json(results);
};
