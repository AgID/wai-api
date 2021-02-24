import messages from '../../utils/messages';

const notAllowed = () => ({
  error: true,
  message: messages.errors.forbidden,
});

export default (headers, idSite) => {
  if (Number.isNaN(idSite)) return { error: true, message: messages.errors.invalidSiteId };

  const consumerCustomId = headers['x-consumer-custom-id'];

  if (typeof consumerCustomId === 'string') {
    let customId;
    let permission;

    try {
      customId = JSON.parse(headers['x-consumer-custom-id']);
    } catch (error) {
      return {
        error: true,
        status: 500,
        message: messages.errors.internalServerError,
      };
    }

    const isAdmin = customId.type === 'admin';
    const hasIdList = Array.isArray(customId.siteId);

    if (isAdmin) {
      permission = 'admin';
    } else if (!isAdmin && hasIdList) {
      if (idSite !== -1) {
        const site = customId.siteId.find(elem => elem.id === idSite);
        permission = site?.permission;

        if (!permission) {
          return notAllowed();
        }
      } else {
        permission = 'R';
      }
    } else {
      return notAllowed();
    }

    return { error: false, permission };
  }

  return {
    error: true,
    status: 500,
    message: messages.errors.internalServerError,
  };
};
