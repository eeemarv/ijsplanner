const brevo = require('@getbrevo/brevo');
let defaultClient = brevo.ApiClient.instance;

let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = 'xkeysib-YOUR_API_KEY';

let apiInstance = new brevo.TransactionalEmailsApi();
let sendSmtpEmail = new brevo.SendSmtpEmail();

sendSmtpEmail.subject = "My {{params.subject}}";
sendSmtpEmail.htmlContent = "<html><body><h1>Common: This is my first transactional email {{params.parameter}}</h1></body></html>";
sendSmtpEmail.sender = { "name": "John", "email": "example@brevo.com" };
sendSmtpEmail.to = [
  { "email": "brevo@brevo.com", "name": "John" }
];
sendSmtpEmail.replyTo = { "email": "brevo@brevo.com", "name": "John" };
sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
sendSmtpEmail.params = { "parameter": "My param value", "subject": "common subject" };
sendSmtpEmail.messageVersions = [{
    "to": [
      {
        "email": "brevo@brevo.com",
        "name": "John"
      }
    ],
    "headers": {
      "Message-Id": "<123.123@smtp-relay.mailin.fr>"
    },
    "params": {
      "greeting": "Welcome onboard!",
      "headline": "Be Ready for Takeoff."
    },
    "subject": "+001",
    "htmlContent": "<html><body><h1>+001 content</h1></body></html>"
  },
  {
    "to": [
      {
        "email": "brevo@brevo.com",
        "name": "Steve"
      }
    ],
    "params": {
      "greeting": "Greeting 1.",
      "headline": "Some bathing suits you might like"
    },
    "subject": "+002"
}];

apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
  console.log('API called successfully. Returned data: ' + JSON.stringify(data));
}, function (error) {
  console.error(error);
});