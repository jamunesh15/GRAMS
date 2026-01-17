const grievanceConfirmationTemplate = (userName, trackingId, grievanceTitle, grievanceCategory) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Grievance Submitted - GRAMS</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0fdf4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #059669 100%); border-radius: 16px 16px 0 0;">
                                <div style="width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                                    <span style="font-size: 28px; font-weight: bold; color: #ffffff;">G</span>
                                </div>
                                <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">GRAMS</h1>
                                <p style="color: rgba(255,255,255,0.9); font-size: 12px; margin: 8px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Grievance Management System</p>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px;">
                                <div style="text-align: center; margin-bottom: 24px;">
                                    <span style="font-size: 48px;">✅</span>
                                </div>
                                <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 16px 0; text-align: center;">Grievance Submitted Successfully!</h2>
                                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                                    Hello <strong>${userName}</strong>,<br>
                                    Your grievance has been successfully submitted to our system. We will review it and take appropriate action.
                                </p>
                                
                                <!-- Tracking ID Box -->
                                <div style="background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); border-left: 4px solid #2563eb; border-radius: 12px; padding: 24px; margin: 24px 0;">
                                    <h3 style="color: #1e40af; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Your Tracking ID</h3>
                                    <p style="color: #1f2937; font-size: 24px; font-weight: 700; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 1px;">${trackingId}</p>
                                    <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0 0;">Please save this ID for future reference</p>
                                </div>
                                
                                <!-- Grievance Details -->
                                <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 24px 0;">
                                    <h3 style="color: #374151; font-size: 16px; margin: 0 0 16px 0;">Grievance Details:</h3>
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <tr>
                                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 30%;">Title:</td>
                                            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${grievanceTitle}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Category:</td>
                                            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-transform: capitalize;">${grievanceCategory}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Status:</td>
                                            <td style="padding: 8px 0;">
                                                <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">OPEN</span>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                
                                <!-- Next Steps -->
                                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 24px 0;">
                                    <h3 style="color: #92400e; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">📋 What Happens Next?</h3>
                                    <ul style="color: #78350f; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                        <li>Our team will review your grievance within 24-48 hours</li>
                                        <li>You'll receive email updates on status changes</li>
                                        <li>An official will be assigned to resolve your issue</li>
                                        <li>You can track progress anytime using your Tracking ID</li>
                                    </ul>
                                </div>
                                
                                <!-- CTA Buttons -->
                                <table role="presentation" style="width: 100%; margin: 24px 0;">
                                    <tr>
                                        <td align="center">
                                            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/track" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 14px; margin: 0 8px;">
                                                🔍 Track Your Grievance
                                            </a>
                                            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background-color: #f3f4f6; color: #374151; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 14px; margin: 0 8px;">
                                                📊 Go to Dashboard
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Help Section -->
                                <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
                                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                                        Need help? Contact us at <a href="mailto:support@grams.gov.in" style="color: #16a34a; text-decoration: none; font-weight: 600;">support@grams.gov.in</a><br>
                                        or call our helpline: <strong style="color: #1f2937;">1800-123-4567</strong>
                                    </p>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
                                <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px 0;">
                                    © ${new Date().getFullYear()} GRAMS - Grievance Redressal And Management System
                                </p>
                                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                    This is an automated email. Please do not reply to this message.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

module.exports = grievanceConfirmationTemplate;
