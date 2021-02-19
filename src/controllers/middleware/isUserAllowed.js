export default (headers, idSite) => {
  if (Number.isNaN(idSite)) return { error: true, message: 'idSite not valid' };

  const consumerCustomId = headers['x-consumer-custom-id'];

  if (typeof consumerCustomId === 'string') {
    let customId;
    let permission;

    try {
      customId = JSON.parse(headers['x-consumer-custom-id']);
      const isAdmin = customId.type === 'admin';
      const hasIdList = Array.isArray(customId.siteId);

      if (isAdmin) {
        permission = 'admin';
      } else if (!isAdmin && hasIdList) {
        if (idSite > 0) {
          permission = customId.siteId.find((elem) => elem.id === idSite);
          permission = permission?.permission;
          if (!permission) {
            return {
              error: true,
              message: `Not allowed to access website with idSite '${idSite}'`,
            };
          }
        } else {
          permission = 'R';
        }
      } else {
        permission = false;
      }
    } catch (error) {
      return {
        error: true,
        message: 'x-consumer-custom-id must be in JSON format',
      };
    }

    if (permission) {
      return { error: false, permission };
    }
  }
  return {
    error: true,
    message: 'Failed to find credential',
  };
};
