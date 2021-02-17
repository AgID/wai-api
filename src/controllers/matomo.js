import apiCall from '../services/apiCall';
import config from '../config/config';
import isUserAllowed from './middleware/isUserAllowed';
import isMethodAllowed from './middleware/isMethodAllowed';

export default async (req, res) => {
  const isModulePublic = Array.isArray(config.matomo?.publicMethods)
    ? config.matomo.publicMethods.find(
      (elem) => req.query?.method
          && elem
          && elem.toLowerCase() === req.query?.method.toLowerCase(),
    )
    : false;

  // eslint-disable-next-line radix
  const idSite = req.query?.idSite ? parseInt(req.query.idSite) : -1;

  if (!isModulePublic) {
    const isAllowedUser = isUserAllowed(
      req.headers,
      idSite,
    );

    if (isAllowedUser.error === true) return res.status(403).json({ error: isAllowedUser.message });

    const isAllowedMethod = isMethodAllowed(
      req.query?.module,
      req.query?.method,
      isAllowedUser.permission,
    );

    if (isAllowedMethod.error === true) {
      return res.status(403).json({ error: isAllowedMethod.message });
    }
  }

  const params = req.originalUrl;

  const { method } = req;
  const url = process.env.ANALYTICS_PUBLIC_URL + encodeURI(params);

  const results = await apiCall({ method, url, data: {} });
  if (results.error) return res.status(results?.status || 200).json({ error: results.message });

  return res.status(200).json(results);
};
