class EmailSendException {
  constructor(details, emailSenderBackend) {
    this.details = details;
    this.message = details.message;
    this.emailSenderBackend = emailSenderBackend;
    this.name = 'EmailSendException';
  }
}

class EmailValidationException {
  constructor(joiException) {
    this.details = joiException.details;
    this.message = joiException.message;
    this.name = 'EmailValidationException';
  }
}

module.exports = { EmailSendException, EmailValidationException };
