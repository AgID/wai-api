import fetch from 'node-fetch';

/**
 * @param  {string} method
 * @param  {string} url
 * @param  {object} data
 */
export default async ({ method, url, data }) => {
  const hasBody = !['GET', 'HEAD', 'DELETE', 'OPTIONS'].includes(method.toUpperCase());
  let response;

  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      ...(hasBody && { body: JSON.stringify(data) }),
    });
    const contentType = response.headers.get('content-type');

    if (!contentType.includes('application/json')) {
      throw new Error('Response was not in JSON format');
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err.message);

    return {
      status: err.name === 'FetchError'
        ? 503
        : 500,
      error: true,
      message: err.name === 'FetchError'
        ? 'Error in backend network'
        : err.message,
    };
  }

  return {
    status: response.status,
    error: !response.ok,
    results: await response.json(),
  };
};
