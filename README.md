# email-api-example

[![dependencies][dependencies-badge]][dependencies-href]
[![dev-dependencies][dev-dependencies-badge]][dev-dependencies-href]

A sample implementation of a multi-email-api backend.

[dependencies-badge]: https://img.shields.io/david/mmedal/email-api-example/master.svg?style=flat-square
[dependencies-href]: https://david-dm.org/mmedal/email-api-example/master#info=dependencies

[dev-dependencies-badge]: https://img.shields.io/david/dev/mmedal/email-api-example/master.svg?style=flat-square
[dev-dependencies-href]: https://david-dm.org/mmedal/email-api-example/master?type=dev

## Installing & Running

Ensure you have Mailgun and Mandrill api keys and specify them in `.env`. Also, specify your
primary email backend.

```
MAILGUN_API_KEY=changeme
MAILGUN_DOMAIN=changeme
MANDRILL_API_KEY=changeme
PRIMARY_EMAIL_BACKEND=mailgun
```

Clone the project, install dependencies, run tests, and start the server.

```
$> git clone https://github.com/mmedal/email-api-example.git
$> cd email-api-example
$> yarn
$> yarn --silent test
$> yarn develop
```

Try the API out with a POST to `127.0.0.1:3000/api/email` and a json payload:
```
{
  "to": "fake@example.com",
  "to_name”: "Mr. Fake",
  "from": "noreply@fake.com",
  "from_name": "Faker",
  "subject": "A Message from Fakebot", 
  "body": "<h1>Awesome!</h1><p>Woo!</p>"
}
```

## Language, Framework, & Library Choices

- nodejs with express: Node + Express is designed for getting a lightweight web API up and
running quickly, with little boilerplate - perfect for this exercise.
- html-to-text & joi: Always take advantage of highly trafficked and maintained opensource
libraries instead of implementing functionality from scratch (these libs are for html stripping
and model-schema validation respectively). Not only does this reduce development time, but also
reduces the amount of tests that need to be written.
- nock, supertest, & tape: Good software development means making use of good testing libraries,
test tooling, and proper module mocking for ultimate test coverage.

## Concerns & Future Enhancements

This API has been strictly implemented as per the specifications, but there are a few design
decisions that I would challenge. For example:
- While this API is intended to be a simple email-sending abstraction, I think allowing 
for multiple "to" addresses should be a natural inclusion. 
- The spec specifies that all HTML in the body should be stripped and sent as plaintext, but both
mailgun and mandrill support HTML bodies. We should be setting _both_ the `plainTextBody` and
`htmlBody` parameters in both APIs for maximum flexibility for email recipients.
- While this spec defines a usable high-availability model, we could greatly improve upon it.
The first improvement we could make is to dynamically fall back upon the backup email service
rather that requiring a config change and redeploy. This is a good first step, but a more
production-ready change would be to introduce persistent queuing for emails. In this design,
once an email has been validated and approved for sending, `/email` submits the email job to
a persistent queue (in-memory, redis, kue, etc...) and returns a 201 immediately. In this way, 
we can implement features like retrys, backend fallbacks, and guarantee our users that, barring 
a catastrophe, their email _will_ be sent!
