const nock = require('nock');
const test = require('tape');

const { MAILGUN_DOMAIN } = require('../../lib/constants.js');
const { Email, EmailSender } = require('../../lib/modules/email.js');

test('email validation should work as expected', t => {
  const email = new Email(
    'fake@example.com',
    'Mr. Fake',
    'noreply@mybrightwheel.com',
    'Brightwheel',
    'A Message from Brightwheel',
    '<h1>Your Bill</h1><p>$10</p>'
  );

  const goodResult = email.validate();
  t.equal(goodResult.error, null,
    'no errors are found when validation is ran on a clean email');
  t.equal(email.plainTextBody, 'YOUR BILL\n$10',
    'html has been stripped and properly formatted as plain text');

  email.to = 'fake';
  email.from = undefined;
  const badResult = email.validate();
  const expectedErrors = [
    {
      message: '"to" must be a valid email',
      path: [ 'to' ],
      type: 'string.email',
      context: { value: 'fake', key: 'to', label: 'to' }
    },
    {
      message: '"from" is required',
      path: [ 'from' ],
      type: 'any.required',
      context: { key: 'from', label: 'from' }
    }
  ];
  t.deepEqual(badResult.error.details, expectedErrors,
    'to-field and from-field are declared invalid as expected when to-field ' +
    'is submitted as an invalid email and from-field is omitted');
  t.end();
});

test('mailgun email sending should work as expected', async t => {
  const email = new Email(
    'example@example.com',
    'John Doe',
    'fake@domain.mailgun.org',
    'Mailgun Fake',
    'A Message from yours truly',
    '<h1>Wowza!</h1><p>I love testing.</p>'
  );
  const client = new EmailSender(email);

  nock('https://api.mailgun.net:443', {'encodedQueryParams': true})
    .post(`/v3/${MAILGUN_DOMAIN}/messages`, /.+/)
    .reply(201);
  await client.sendMailViaMailgun();
  t.pass('when mailgun returns a 201, the mail client succeeds silently');

  nock('https://api.mailgun.net:443', {'encodedQueryParams': true})
    .post(`/v3/${MAILGUN_DOMAIN}/messages`, /.+/)
    .replyWithError({
      name: 'StatusCodeError: 401 - "Forbidden"',
      message: '401 - "Forbidden"',
      statusCode: 401
    });
  try {
    await client.sendMailViaMailgun();
  } catch (error) {
    t.equal(error.name, 'EmailSendException',
      'when mailgun returns a 400, the mail client raises EmailSendException');
  }
  t.end();
});

test('mandrill email sending should work as expected', async t => {
  const email = new Email(
    'example@example.com',
    'John Doe',
    'fake@domain.mailgun.org',
    'Mailgun Fake',
    'A Message from yours truly',
    '<h1>Wowza!</h1><p>I love testing.</p>'
  );
  const client = new EmailSender(email);

  nock('https://mandrillapp.com:443', {'encodedQueryParams': true})
    .post('/api/1.0/messages/send.json', /.+/)
    .reply(201);
  await client.sendMailViaMandrill();
  t.pass('when mandrill returns a 201, the mail client succeeds silently');

  nock('https://mandrillapp.com:443', {'encodedQueryParams': true})
    .post('/api/1.0/messages/send.json', /.+/)
    .replyWithError({
      name: 'StatusCodeError: 401 - "Forbidden"',
      message: '401 - "Forbidden"',
      statusCode: 401
    });
  try {
    await client.sendMailViaMandrill();
  } catch (error) {
    t.equal(error.name, 'EmailSendException',
      'when mandrill returns a 400, the mail client raises EmailSendException');
  }
  t.end();
});
