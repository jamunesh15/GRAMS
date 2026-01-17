const welcomeTemplate = (userName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to GRAMS</title>
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
                                    <span style="font-size: 48px;">🎉</span>
                                </div>
                                <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 16px 0; text-align: center;">Welcome to GRAMS!</h2>
                                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                                    Hello <strong>${userName}</strong>,<br>
                                    Your account has been successfully created. You're now part of our community of 12,000+ citizens working together for better governance.
                                </p>
                                
                                <!-- Features -->
                                <div style="background-color: #f0fdf4; border-radius: 12px; padding: 24px; margin: 24px 0;">
                                    <h3 style="color: #16a34a; font-size: 16px; margin: 0 0 16px 0;">What you can do with GRAMS:</h3>
                                    <ul style="color: #374151; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
                                        <li>📝 File grievances easily</li>
                                        <li>🔍 Track your complaint status in real-time</li>
                                        <li>📊 View transparency reports and budget data</li>
                                        <li>👥 Connect with your community</li>
                                        <li>📈 Monitor performance metrics</li>
                                    </ul>
                                </div>
                                
                                <!-- CTA Button -->
                                <div style="text-align: center; margin: 32px 0;">
                                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                        Login to Your Account
                                    </a>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
                                <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
                                    Need help? Contact us at support@grams.gov.in
                                </p>
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

module.exports = welcomeTemplate;
