import apiCall from "../services/apiCall";
import config from "../config/config";

const isMethodAllowed = (module, method) => {
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
    ? allowModule?.methods.find(
        (elem) => elem.toLowerCase() === method.toLowerCase()
      )
    : false;

  if (!allowMethod) return { error: true, message: "Method not allowed" };

  return { error: false };
};

export default async (req, res) => {
  const isAllowed = isMethodAllowed(req.query.module, req.query.method);

  if (isAllowed.error === true)
    return res.status(400).json({ error: isAllowed.message });

  const params = req.originalUrl;

  const method = req.method;
  const url = process.env.ANALYTICS_PUBLIC_URL + encodeURI(params);
  
  const results = await apiCall({ method: method, url: url, data: {} });
  if (results.error)
    return res.status(results?.status || 200).json({ error: results.message });

  return res.status(200).json(results);
};
