const url = require('url');

const express = require('express');

const { Email, EmailSender } = require('../modules/email.js');

const router = express.Router();

/**
 * Simple root API view for displaying avaiable API endpoints.
 */
router.get('/', async (req, res) => {
  const baseUrl = url.format({
    protocol: req.protocol,
    host: req.hostname,
    pathname: req.originalUrl
  });

  res.json({ 'email': `${baseUrl}/email` });
});

/**
 * The main email service endpoint. Sends emails via multiple email backends
 * depending on availability. Performs validation on parameters & will return
 * 201 if the request was successful or a 400 if the request wasn't validated.
 *
 * Post payload parameters:
 * @param {Object} req.body - The email payload
 * @param {string} req.body.to - The email address to send to
 * @param {string} req.body.toName - The name to accompany the email
 * @param {string} req.body.from - The email address in the from/reply fields
 * @param {string} req.body.fromName - The name to accompany the from/reply
 *  emails
 * @param {string} req.body.subject - The subject line of the email
 * @param {string} req.body.body - The HTML body of the email
 */
router.post('/email', async (req, res) => {
  const email = new Email(
    req.body.to, req.body.toName, req.body.from,
    req.body.fromName, req.body.subject, req.body.body);
  const emailClient = new EmailSender(email);
  try {
    await emailClient.sendMail();
    res.send(201);
  } catch (error) {
    res.status(400);
    res.json(error);
  }
});

module.exports = router;
