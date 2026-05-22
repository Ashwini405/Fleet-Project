/**
 * Email Service — placeholder for future Nodemailer integration.
 *
 * To activate:
 *   npm install nodemailer
 *   Fill in transporter config from environment variables.
 */

// const nodemailer = require('nodemailer');
// const transporter = nodemailer.createTransport({ ... });

/**
 * Send a warranty expiry reminder email.
 * @param {object} warranty  - warranty record
 * @param {number} daysLeft  - days until expiry
 * @param {string} toEmail   - recipient email address
 */
async function sendWarrantyExpiryEmail(warranty, daysLeft, toEmail) {
  // TODO: implement when email credentials are available
  console.log(`[EmailService] Would send expiry email to ${toEmail} for warranty ${warranty.warranty_number} (${daysLeft} days left)`);
}

module.exports = { sendWarrantyExpiryEmail };
