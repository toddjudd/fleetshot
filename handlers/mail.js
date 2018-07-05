const nodemailer = require('nodemailer')
const pug = require('pug')
const juice = require('juice')
const htmlToText = require('html-to-text')
const promisify = require('es6-promisify')
const moment = require('moment')
const h = require('./../helpers')

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options)
  const inlined = juice(html)
  return inlined
}

exports.sendPDF = async (options) => {
  const html = generateHTML(options.filename, options)
  const text = htmlToText.fromString(html)
  const mailOptions = {
    from: 'Todd Judd <todd.judd@gmail.com>',
    to: options.customerEmail,
    cc: 'Todd Judd <toddjudd@gmail.com>',
    subject: options.subject,
    html,
    text
  };
  const sendMail = promisify(transport.sendMail, transport)
  return sendMail(mailOptions)
}