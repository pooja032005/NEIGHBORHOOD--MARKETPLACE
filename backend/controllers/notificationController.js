// Notification Controller - Handles SMS and Email Notifications

exports.sendSMS = async (req, res) => {
  try {
    const { phone, name, orderId, total, paymentMethod, address, city } = req.body;

    // Validate phone number
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }

    const message = `Hello ${name}, Your order #${orderId} has been placed successfully! Amount: ₹${total} | Payment: ${paymentMethod} | Delivery: ${address}, ${city}. Thank you for shopping with NeighborhoodMarket!`;

    // TODO: Integrate with actual SMS service (Twilio, AWS SNS, etc.)
    // For now, we'll log it and return success
    console.log(`[SMS NOTIFICATION] To: ${phone}`);
    console.log(`Message: ${message}`);

    // Example with Twilio (uncomment and configure with actual credentials):
    /*
    const twilio = require('twilio');
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: '+91' + phone
    });
    */

    return res.status(200).json({
      success: true,
      message: 'SMS notification queued for sending',
      phone: phone
    });
  } catch (error) {
    console.error('SMS notification error:', error);
    // Don't fail the entire request if notification fails
    return res.status(200).json({
      success: true,
      message: 'Order placed successfully (notification delivery in progress)'
    });
  }
};

exports.sendEmail = async (req, res) => {
  try {
    const { email, name, orderId, total, paymentMethod, address, city } = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const emailContent = `
      <h2>Order Confirmation</h2>
      <p>Dear ${name},</p>
      <p>Thank you for your purchase! Your order has been placed successfully.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> #${orderId}</p>
        <p><strong>Amount:</strong> ₹${total}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
        <p><strong>Delivery Address:</strong> ${address}, ${city}</p>
      </div>
      
      <p>We will notify you once your order is confirmed and shipped.</p>
      <p>For any queries, please contact us at support@neighborhoodmarket.com</p>
      
      <p>Best regards,<br>NeighborhoodMarket Team</p>
    `;

    // TODO: Integrate with actual Email service (SendGrid, AWS SES, Nodemailer, etc.)
    // For now, we'll log it and return success
    console.log(`[EMAIL NOTIFICATION] To: ${email}`);
    console.log(`Subject: Order Confirmation #${orderId}`);
    console.log(`Content: ${emailContent}`);

    // Example with Nodemailer (uncomment and configure):
    /*
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Order Confirmation - Order #${orderId}`,
      html: emailContent
    });
    */

    return res.status(200).json({
      success: true,
      message: 'Email notification queued for sending',
      email: email
    });
  } catch (error) {
    console.error('Email notification error:', error);
    // Don't fail the entire request if notification fails
    return res.status(200).json({
      success: true,
      message: 'Order placed successfully (notification delivery in progress)'
    });
  }
};

// Send notification to seller about new order
exports.notifySeller = async (req, res) => {
  try {
    const { sellerEmail, sellerPhone, buyerName, orderId, itemTitle, quantity, amount } = req.body;

    const sellerMessage = `New order received! Buyer: ${buyerName}, Order ID: #${orderId}, Item: ${itemTitle} (Qty: ${quantity}), Amount: ₹${amount}`;

    console.log(`[SELLER NOTIFICATION] Email: ${sellerEmail}, Phone: ${sellerPhone}`);
    console.log(`Message: ${sellerMessage}`);

    return res.status(200).json({
      success: true,
      message: 'Seller notification sent',
      sellerEmail: sellerEmail
    });
  } catch (error) {
    console.error('Seller notification error:', error);
    return res.status(200).json({
      success: true,
      message: 'Seller notification queued'
    });
  }
};

// Helper: send seller notification for chat messages (used internally by chat controller)
async function sendSellerChatNotification({ sellerEmail, sellerPhone, buyerName, messagePreview, productTitle, productType }) {
  // Feature flag to disable globally if needed
  if (process.env.ENABLE_CHAT_NOTIFICATIONS === 'false') {
    return { sent: false, reason: 'disabled' };
  }

  const preview = messagePreview || 'New message received';
  const productLabel = productTitle ? ` about ${productTitle}` : '';
  const subject = 'New buyer question on Neighborhood Marketplace';
  const bodyText = `You have a new message from ${buyerName || 'Buyer'}${productLabel}: ${preview}${productType ? ` (Type: ${productType})` : ''}`;

  // EMAIL via Nodemailer (optional)
  if (sellerEmail && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: sellerEmail,
        subject,
        text: bodyText
      });
    } catch (err) {
      console.error('Email send error (chat notify):', err.message);
    }
  }

  // SMS via Twilio (optional)
  if (sellerPhone && /^\d{10}$/.test(String(sellerPhone)) && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: bodyText,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: '+91' + String(sellerPhone)
      });
    } catch (err) {
      console.error('SMS send error (chat notify):', err.message);
    }
  }

  // Always log for traceability
  console.log(`[CHAT NOTIFY] Seller email: ${sellerEmail || 'N/A'} | phone: ${sellerPhone || 'N/A'} | Buyer: ${buyerName || 'Buyer'} | Product: ${productTitle || 'N/A'} | Preview: ${preview}`);

  return { sent: true };
}

exports.sendSellerChatNotification = sendSellerChatNotification;
