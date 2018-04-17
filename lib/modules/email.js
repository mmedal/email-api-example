const htmlToText = require('html-to-text');
const Joi = require('joi');
const request = require('request-promise-native');

const {
  MAILGUN_API_KEY,
  MAILGUN_DOMAIN,
  MANDRILL_API_KEY,
  PRIMARY_EMAIL_BACKEND
} = require('../constants.js');
const { EmailSendException, EmailValidationException } = require('./exceptions');

class Email {
  constructor (to, toName, from, fromName, subject, body) {
    this.to = to;
    this.toName = toName;
    this.from = from;
    this.fromName = fromName;
    this.subject = subject;
    this.body = body;
    this.plainTextBody = htmlToText.fromString(body);
    this.schema = Joi.object().keys({
      to: Joi.string().required().email(),
      toName: Joi.string().required().regex(/^[a-zA-Z.\s]*$/),
      from: Joi.string().required().email(),
      fromName: Joi.string().required().regex(/^[a-zA-Z.\s]*$/),
      subject: Joi.string().required(),
      body: Joi.string().required()
    });
  }

  validate () {
    return Joi.validate({
      to: this.to,
      toName: this.toName,
      from: this.from,
      fromName: this.fromName,
      subject: this.subject,
      body: this.body
    }, this.schema, { abortEarly: false });
  }

  validateOrThrow () {
    const result = this.validate();
    if (result.error !== null) throw new EmailValidationException(result.error);
  }
}

class EmailSender {
  constructor (email) {
    this.email = email;
    this.mailgunApiKey = MAILGUN_API_KEY;
    this.mailgunDomain = MAILGUN_DOMAIN;
    this.mandrillApiKey = MANDRILL_API_KEY;
    this.primaryEmailBackend = PRIMARY_EMAIL_BACKEND;
  }

  async sendMailViaMailgun () {
    const authBuff = Buffer.from(this.mailgunApiKey);
    const authString = authBuff.toString('base64');
    const postOptions = {
      method: 'POST',
      uri: `https://api.mailgun.net/v3/${this.mailgunDomain}/messages`,
      form: {
        from: `${this.email.fromName} <${this.email.from}>`,
        to: `${this.email.toName} <${this.email.to}>`,
        subject: this.email.subject,
        text: this.email.plainTextBody
      },
      headers: {
        'Authorization': `Basic ${authString}`
      }
    };

    try {
      await request(postOptions);
    } catch (error) {
      throw new EmailSendException(error, 'Mailgun');
    }
  }

  async sendMailViaMandrill () {
    const postOptions = {
      method: 'POST',
      uri: 'https://mandrillapp.com/api/1.0/messages/send.json',
      body: {
        key: this.mandrillApiKey,
        message: {
          from_email: this.email.from,
          from_name: this.email.fromName,
          to: [
            {
              email: this.email.to,
              name: this.email.toName,
              type: 'to'
            }
          ],
          subject: this.email.subject,
          text: this.email.plainTextBody
        }
      },
      json: true
    };

    try {
      await request(postOptions);
    } catch (error) {
      throw new EmailSendException(error, 'Mandrill');
    }
  }

  async sendMail () {
    this.email.validateOrThrow();
    if (this.primaryEmailBackend === 'mailgun') {
      await this.sendMailViaMailgun();
    } else {
      await this.sendMailViaMandrill();
    }
  }
}

module.exports = { Email, EmailSender };
