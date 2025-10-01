import mjml2html from "mjml";
import Handlebars from "handlebars";

export function renderEmail(template: string, data: Record<string, any>) {
  const compiled = Handlebars.compile(template);
  const mjml = compiled(data);

  const { html, errors } = mjml2html(mjml, { minify: true });
  if (errors.length > 0) {
    console.error("MJML errors:", errors);
    throw new Error("Failed to compile MJML");
  }
  return html;
}
