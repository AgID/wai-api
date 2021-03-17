import apiCall from '../services/apiCall';
import config from '../config/config';
import isUserAllowed from './middleware/isUserAllowed';
import isMethodAllowed from './middleware/isMethodAllowed';
import messages from '../utils/messages';

export default async (req, res) => {
  if (!config?.matomo?.enabled || Object.keys(config.matomo.enabled).length < 1) {
    return res.status(500).json({ error: messages.errors.misconfiguredServer });
  }

  if (typeof req.query?.module !== 'string' || typeof req.query?.method !== 'string') {
    return res.status(400).json({ error: messages.errors.malformedParameters });
  }

  const queryModule = req.query.module;
  const queryMethod = req.query.method;

  const isPubliclyAllowed = config.matomo?.public
    && config.matomo.public[queryModule]
    && config.matomo.public[queryModule]?.[queryMethod] !== undefined;
  // eslint-disable-next-line radix
  const idSite = req.query?.idSite ? parseInt(req.query.idSite) : -1;

  if (!isPubliclyAllowed) {
    const isAllowedUser = isUserAllowed(
      req.headers,
      idSite,
    );

    if (isAllowedUser.error === true) {
      return res.status(isAllowedUser.status || 403).json({ error: isAllowedUser.message });
    }

    const isAllowedMethod = isMethodAllowed(
      queryModule,
      queryMethod,
      isAllowedUser.permission,
    );

    if (isAllowedMethod.error === true) {
      return res.status(isAllowedMethod.status).json({ error: isAllowedMethod.message });
    }
  }

  let params = req.originalUrl;

  if (!req.query?.format) {
    params = `${params}&format=JSON`;
  } else if (typeof req.query.format !== 'string' || req.query.format.toLowerCase() !== 'json') {
    return res.status(400).json({ error: messages.errors.malformedParameters });
  }

  const { method } = req;
  const url = process.env.ANALYTICS_PUBLIC_URL + encodeURI(params);

  const response = await apiCall({ method, url, data: {} });

  if (response.error) {
    return res.status(response.status).json(response.message
      ? { message: response.message }
      : response.results);
  }

  return res.status(response.status).json(response.results);
};
