// SMS Service Configuration - Choose your provider
// Supported providers: Twilio, AWS SNS, or other SMS APIs

const sendOTP = async (phoneNumber, otp) => {
  try {
    // phoneNumber format: +91 followed by 10 digits
    // otp format: 6-digit string
    
    // OPTION 1: Using Twilio (Recommended)
    // Install: npm install twilio
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // 
    // const message = await client.messages.create({
    //   body: `Your GRAMS OTP is: ${otp}. Valid for 5 minutes.`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber
    // });
    //
    // console.log(`OTP sent to ${phoneNumber}. Message SID: ${message.sid}`);
    // return { success: true, messageId: message.sid };

    // OPTION 2: Using AWS SNS
    // Install: npm install aws-sdk
    // const AWS = require('aws-sdk');
    // const sns = new AWS.SNS({
    //   region: process.env.AWS_REGION,
    //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    // });
    //
    // const params = {
    //   Message: `Your GRAMS OTP is: ${otp}. Valid for 5 minutes.`,
    //   PhoneNumber: phoneNumber
    // };
    //
    // const result = await sns.publish(params).promise();
    // console.log(`OTP sent to ${phoneNumber}. Message ID: ${result.MessageId}`);
    // return { success: true, messageId: result.MessageId };

    // OPTION 3: Using 99SMS / Other Indian SMS Providers
    // Example: 99SMS API
    // Install: npm install axios
    // const axios = require('axios');
    // 
    // const response = await axios.get('https://api.99sms.com/sendsms', {
    //   params: {
    //     authkey: process.env.SMS_AUTH_KEY,
    //     mobiles: phoneNumber.replace('+91', ''),
    //     message: `Your GRAMS OTP is: ${otp}. Valid for 5 minutes.`,
    //     sender: 'GRAMS'
    //   }
    // });
    // 
    // return { success: true, response: response.data };

    // MOCK IMPLEMENTATION (for development)
    console.log(`📱 [MOCK SMS] OTP sent to ${phoneNumber}: ${otp}`);
    return { 
      success: true, 
      mockOtp: otp,
      message: 'OTP sent successfully (mock mode)',
      phoneNumber: phoneNumber
    };

  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

const verifyOTP = async (phoneNumber, otp, storedOtp, expiryTime = 300000) => {
  // expiryTime in milliseconds (default 5 minutes)
  try {
    if (otp !== storedOtp) {
      return { success: false, message: 'Invalid OTP' };
    }

    // Check if OTP has expired (you would need to store the timestamp when OTP was sent)
    // This is a simplified example
    return { success: true, message: 'OTP verified successfully' };

  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error('OTP verification failed');
  }
};

module.exports = {
  sendOTP,
  verifyOTP
};
