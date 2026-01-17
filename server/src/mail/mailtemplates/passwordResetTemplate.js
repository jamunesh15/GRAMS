const passwordResetTemplate = (otp, userName = "User") => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - GRAMS</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0fdf4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 16px 16px 0 0;">
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
                                    <span style="font-size: 48px;">🔐</span>
                                </div>
                                <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 16px 0; text-align: center;">Password Reset Request</h2>
                                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                                    Hello <strong>${userName}</strong>,<br>
                                    We received a request to reset your password. Use the OTP below to proceed.
                                </p>
                                
                                <!-- OTP Box -->
                                <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #dc2626; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Your Reset Code</p>
                                    <h1 style="color: #dc2626; font-size: 42px; margin: 0; letter-spacing: 12px; font-weight: 700;">${otp}</h1>
                                </div>
                                
                                <p style="color: #ef4444; font-size: 14px; text-align: center; margin: 24px 0;">
                                    ⏰ This code expires in <strong>10 minutes</strong>
                                </p>
                                
                                <!-- Warning -->
                                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0; margin: 24px 0;">
                                    <p style="color: #92400e; font-size: 14px; margin: 0;">
                                        <strong>⚠️ Didn't request this?</strong> If you didn't request a password reset, please ignore this email or contact support immediately.
                                    </p>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
                                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                    © 2025 GRAMS - Nexus TechSol. All rights reserved.
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

module.exports = passwordResetTemplate;
