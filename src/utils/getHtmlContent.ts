import { populateTemplate } from "./populateTemplate";

export const getHtmlContent = async (
  baseUrl: string,
  options: Record<string, string>
) => {
  const fileResponse = await fetch(`${baseUrl}/static/template.html`);
  const fileContent = await fileResponse.text();

  const populatedTemplate = populateTemplate(fileContent, options);
  return populatedTemplate;
};
