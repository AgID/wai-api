import fetch from 'node-fetch';
/**
 * @param  {string} method
 * @param  {string} url
 * @param  {object} data
 */

export default async ({ method, url, data }) => {
  const hasBody = method !== 'GET' && method !== 'HEAD';
  let response;
  try {
    const results = await fetch(url, {
      method,
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      referrerPolicy: 'no-referrer',
      ...(hasBody && { body: JSON.stringify(data) }),
    });
    const contentType = results.headers.get('content-type');

    if (contentType.includes('application/json')) {
      response = results.json();
    } else {
      throw new Error('Response was not in JSON format');
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err.message || err);
    response = { error: true, message: err.message || err, status: 400 };
  }

  return response;
};
