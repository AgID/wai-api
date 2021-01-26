export default (headers, idSite) => {
  if (isNaN(idSite)) return { error: false, permission: false };

  const consumerCustomId = headers["x-consumer-custom-id"];
  
  if (typeof consumerCustomId === "string") {
    let customId;
    let idList;
    let permissionList;

    try {
      customId = JSON.parse(headers["x-consumer-custom-id"]);
      idList = Array.isArray(customId.siteId)
        ? { ...customId }.siteId.map((elem) => elem.id)
        : undefined;
      permissionList = Array.isArray(customId.siteId)
        ? { ...customId }.siteId.map((elem) => elem.permission)
        : undefined;
    } catch (error) {
      console.log("Error parsing json", error);
      return { error: true, message: "x-consumer-custom-id must be JSON" };
    }

    if (Array.isArray(idList) && idList.includes(idSite)) {
      return { error: false, permission: permissionList };
    }
  }
  return { error: true, message: "Not Allowed" };
}
