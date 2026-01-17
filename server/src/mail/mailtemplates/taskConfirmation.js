const taskConfirmationTemplate = (engineerName, trackingId, taskTitle, status, adminNotes) => {
    const statusConfig = {
        'closed': {
            color: '#16a34a',
            bgColor: '#f0fdf4',
            icon: '✅',
            title: 'Task Confirmed',
            message: 'Your completed task has been reviewed and confirmed by the administrator.'
        },
        'rejected': {
            color: '#dc2626',
            bgColor: '#fef2f2',
            icon: '❌',
            title: 'Task Needs Revision',
            message: 'Please review the admin notes and make necessary corrections.'
        }
    };

    const config = statusConfig[status] || statusConfig['closed'];

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task ${config.title} - GRAMS</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); border-radius: 16px 16px 0 0;">
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
                                    <span style="font-size: 48px;">${config.icon}</span>
                                </div>
                                <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 16px 0; text-align: center;">${config.title}</h2>
                                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                                    Hello <strong>${engineerName}</strong>,<br>
                                    ${config.message}
                                </p>
                                
                                <!-- Task Details -->
                                <div style="background-color: ${config.bgColor}; border-radius: 12px; border-left: 4px solid ${config.color}; padding: 24px; margin: 24px 0;">
                                    <h3 style="color: ${config.color}; font-size: 16px; margin: 0 0 16px 0; font-weight: 600;">Task Details:</h3>
                                    <div style="color: #374151; font-size: 14px; line-height: 2;">
                                        <div style="display: flex; margin-bottom: 8px;">
                                            <span style="font-weight: 600; min-width: 120px;">Tracking ID:</span>
                                            <span>${trackingId}</span>
                                        </div>
                                        <div style="display: flex; margin-bottom: 8px;">
                                            <span style="font-weight: 600; min-width: 120px;">Task:</span>
                                            <span>${taskTitle}</span>
                                        </div>
                                        <div style="display: flex; margin-bottom: 8px;">
                                            <span style="font-weight: 600; min-width: 120px;">Status:</span>
                                            <span style="color: ${config.color}; font-weight: 600; text-transform: capitalize;">${status}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                ${adminNotes ? `
                                <!-- Admin Notes -->
                                <div style="background-color: #fef3c7; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #f59e0b;">
                                    <h3 style="color: #92400e; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">📝 Admin Notes:</h3>
                                    <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${adminNotes}</p>
                                </div>
                                ` : ''}
                                
                                <!-- CTA Button -->
                                <div style="text-align: center; margin: 32px 0;">
                                    <a href="http://localhost:5173/engineer/dashboard" style="display: inline-block; padding: 14px 32px; background-color: ${config.color}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                        View Dashboard
                                    </a>
                                </div>
                                
                                <!-- Info Box -->
                                <div style="background-color: #eff6ff; border-radius: 8px; padding: 16px; margin: 24px 0;">
                                    <p style="color: #1e40af; font-size: 13px; line-height: 1.5; margin: 0;">
                                        <strong>💡 Tip:</strong> Keep up the excellent work! Your dedication to resolving citizen grievances is making a real difference in our community.
                                    </p>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0;">
                                    This is an automated message from the GRAMS system.
                                </p>
                                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                    © ${new Date().getFullYear()} GRAMS. All rights reserved.
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

module.exports = taskConfirmationTemplate;
