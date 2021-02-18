export default (headers, idSite) => {
  if (Number.isNaN(idSite)) return { error: true, message: 'idSite not valid' };

  const consumerCustomId = headers['x-consumer-custom-id'];

  if (typeof consumerCustomId === 'string') {
    let customId;
    let idList;
    let permissions;

    try {
      customId = JSON.parse(headers['x-consumer-custom-id']);

      if (customId.type === 'admin') {
        idList = [];
        permissions = 'admin';
      } else {
        idList = Array.isArray(customId.siteId)
          ? { ...customId }.siteId.map((elem) => elem.id)
          : undefined;
        permissions = Array.isArray(customId.siteId)
          ? { ...customId }.siteId.map((elem) => elem.permission)
          : undefined;
      }
    } catch (error) {
      return {
        error: true,
        message: 'x-consumer-custom-id must be in JSON format',
      };
    }

    if (
      idSite < 0
      || permissions === 'admin'
      || (Array.isArray(idList) && idList.includes(idSite))
    ) {
      return { error: false, permission: permissions };
    }
  }
  return {
    error: true,
    message: 'Failed to find credential',
  };
};
