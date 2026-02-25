// Email template when engineer accepts/starts work on a task

// Email to Admin when engineer accepts the task
exports.taskAcceptedAdminEmail = (adminName, engineerName, grievance, engineerDetails) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">🔄</div>
            <h1 style="margin: 10px 0 5px 0; font-size: 24px; font-weight: 600;">Task In Progress</h1>
            <p style="margin: 0; font-size: 14px; opacity: 0.95;">GRAMS - Grievance Management System</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${adminName}</strong>,</p>
            
            <p style="margin-bottom: 20px;">Engineer <strong>${engineerName}</strong> has accepted and started working on the following grievance:</p>
            
            <!-- Status Badge -->
            <div style="text-align: center; margin: 20px 0;">
              <span style="display: inline-block; padding: 10px 30px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 30px; font-size: 16px; font-weight: bold;">
                🔄 IN PROGRESS
              </span>
            </div>
            
            <!-- Grievance Details -->
            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="margin-top: 0; color: #d97706;">📋 Grievance Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Tracking ID:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${grievance.trackingId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Title:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${grievance.title || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Category:</td>
                  <td style="padding: 8px 0; text-transform: capitalize;">${grievance.category}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Priority:</td>
                  <td style="padding: 8px 0;">
                    <span style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background: ${grievance.priority === 'high' ? '#FEE2E2' : grievance.priority === 'medium' ? '#FEF3C7' : '#D1FAE5'}; color: ${grievance.priority === 'high' ? '#DC2626' : grievance.priority === 'medium' ? '#D97706' : '#059669'};">
                      ${grievance.priority.toUpperCase()}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Location:</td>
                  <td style="padding: 8px 0;">${grievance.location || 'N/A'}</td>
                </tr>
              </table>
            </div>
            
            <!-- Engineer Details -->
            <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 8px; padding: 20px; margin: 20px 0; border: 2px solid #3b82f6;">
              <h3 style="margin-top: 0; color: #1d4ed8;">👷 Assigned Engineer Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Name:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #1e40af;">${engineerDetails.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Engineer ID:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${engineerDetails.engineerId || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Email:</td>
                  <td style="padding: 8px 0;">${engineerDetails.email}</td>
                </tr>
                ${engineerDetails.phone ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;">Phone:</td>
                  <td style="padding: 8px 0;">${engineerDetails.phone}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #666;">Work Started:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #059669;">${new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #666; font-size: 14px;">You can track the progress from your admin dashboard.</p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} GRAMS - Grievance Redressal and Management System
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Email to Citizen when engineer accepts the task - includes engineer details
exports.taskAcceptedUserEmail = (userName, engineerDetails, grievance) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">👷</div>
            <h1 style="margin: 10px 0 5px 0; font-size: 24px; font-weight: 600;">Engineer Assigned to Your Grievance</h1>
            <p style="margin: 0; font-size: 14px; opacity: 0.95;">Work has begun on your complaint</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${userName}</strong>,</p>
            
            <p style="margin-bottom: 20px;">Great news! An engineer has been assigned to your grievance and has started working on it.</p>
            
            <!-- Engineer Details -->
            <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; padding: 25px; margin: 20px 0; border: 2px solid #3b82f6;">
              <h3 style="margin-top: 0; color: #1d4ed8; display: flex; align-items: center;">
                <span style="font-size: 24px; margin-right: 10px;">👨‍🔧</span> Assigned Engineer Details
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #666; width: 40%;">Name:</td>
                  <td style="padding: 10px 0; font-weight: bold; color: #1e40af;">${engineerDetails.name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666;">Engineer ID:</td>
                  <td style="padding: 10px 0; font-weight: bold;">${engineerDetails.engineerId || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666;">Email:</td>
                  <td style="padding: 10px 0;">${engineerDetails.email}</td>
                </tr>
                ${engineerDetails.phone ? `
                <tr>
                  <td style="padding: 10px 0; color: #666;">Phone:</td>
                  <td style="padding: 10px 0;">${engineerDetails.phone}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <!-- Grievance Details -->
            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">📋 Your Grievance</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Tracking ID:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #4f46e5;">${grievance.trackingId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Title:</td>
                  <td style="padding: 8px 0;">${grievance.title || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Category:</td>
                  <td style="padding: 8px 0; text-transform: capitalize;">${grievance.category}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Status:</td>
                  <td style="padding: 8px 0;">
                    <span style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background: #FEF3C7; color: #D97706;">
                      IN PROGRESS
                    </span>
                  </td>
                </tr>
              </table>
            </div>
            
            <div style="background: #ecfdf5; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0; color: #065f46;">
                <strong>💡 What's Next?</strong><br>
                The engineer will work on resolving your grievance. You will receive another email once the work is completed.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px;">You can track your grievance status using the tracking ID: <strong>${grievance.trackingId}</strong></p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} GRAMS - Grievance Redressal and Management System
            </p>
            <p style="margin: 5px 0 0 0; color: #999; font-size: 11px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};
