import Brevo from "npm:@getbrevo/brevo";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY")!;

const brevo = new Brevo.TransactionalEmailsApi();
brevo.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);

export default brevo;
