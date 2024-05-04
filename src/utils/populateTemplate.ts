export const populateTemplate = (template: string, data: Record<string, string>) => {
  let result = template;

  const keys = Object.keys(data);
  for (var i = 0; i < keys.length; i++) {
    const key = keys[i];
    result = result.replace(new RegExp(`{{${key}}}`, "g"), data[key]);
  }
  return result;
};
