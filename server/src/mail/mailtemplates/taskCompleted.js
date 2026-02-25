// Email templates for task completion notifications

// Email to Admin when task is completed
exports.taskCompletedAdminEmail = (adminName, engineerName, grievance, completionDetails) => {
  const budgetInfo = grievance.budget || {};
  const hasBudget = budgetInfo.allocated > 0;
  
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
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
            <h1 style="margin: 10px 0 5px 0; font-size: 24px; font-weight: 600;">Task Completed!</h1>
            <p style="margin: 0; font-size: 14px; opacity: 0.95;">Grievance has been resolved</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${adminName}</strong>,</p>
            
            <p style="margin-bottom: 20px;">Engineer <strong>${engineerName}</strong> has completed work on the following grievance. Please review and confirm.</p>
            
            <!-- Grievance Details -->
            <div style="background: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin-top: 0; color: #059669;">✅ Completed Grievance</h3>
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
                <tr>
                  <td style="padding: 8px 0; color: #666;">Days Taken:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #059669;">${completionDetails.daysToComplete || 'N/A'} days</td>
                </tr>
              </table>
            </div>
            
            ${hasBudget ? `
            <!-- Budget Summary -->
            <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="margin-top: 0; color: #92400e;">💰 Budget Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Allocated:</td>
                  <td style="padding: 8px 0; font-weight: bold;">₹${budgetInfo.allocated?.toLocaleString() || 0}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Spent:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #dc2626;">₹${budgetInfo.spent?.toLocaleString() || 0}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Remaining:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #059669;">₹${budgetInfo.remainingBudget?.toLocaleString() || 0}</td>
                </tr>
              </table>
            </div>
            ` : ''}
            
            ${completionDetails.completionNotes ? `
            <!-- Completion Notes -->
            <div style="background: #f3f4f6; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #374151;">📝 Completion Notes:</h4>
              <p style="margin: 0; color: #4b5563;">${completionDetails.completionNotes}</p>
            </div>
            ` : ''}
            
            <!-- Action Required -->
            <div style="background: #eff6ff; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; color: #1d4ed8;">
                <strong>⚡ Action Required:</strong><br>
                Please review the completed task in your admin dashboard and confirm if the work meets the requirements.
              </p>
            </div>
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

// Email to Citizen when their grievance is completed
exports.taskCompletedUserEmail = (userName, grievance, engineerName, completionDetails) => {
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
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">🎊</div>
            <h1 style="margin: 10px 0 5px 0; font-size: 24px; font-weight: 600;">Your Grievance is Resolved!</h1>
            <p style="margin: 0; font-size: 14px; opacity: 0.95;">Thank you for your patience</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${userName}</strong>,</p>
            
            <p style="margin-bottom: 20px;">We are pleased to inform you that your grievance has been successfully resolved!</p>
            
            <!-- Success Badge -->
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px 40px; border-radius: 50px; font-size: 18px; font-weight: bold;">
                ✅ RESOLVED
              </div>
            </div>
            
            <!-- Grievance Details -->
            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">📋 Grievance Details</h3>
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
                  <td style="padding: 8px 0; color: #666;">Resolved By:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #059669;">${engineerName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Completion Date:</td>
                  <td style="padding: 8px 0;">${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</td>
                </tr>
                ${completionDetails.daysToComplete ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;">Resolution Time:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${completionDetails.daysToComplete} days</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            ${completionDetails.completionNotes ? `
            <!-- Resolution Summary -->
            <div style="background: #ecfdf5; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h4 style="margin-top: 0; color: #065f46;">📝 Resolution Summary:</h4>
              <p style="margin: 0; color: #047857;">${completionDetails.completionNotes}</p>
            </div>
            ` : ''}
            
            <!-- Feedback Request -->
            <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <h4 style="margin-top: 0; color: #92400e;">⭐ We Value Your Feedback!</h4>
              <p style="margin: 0 0 15px 0; color: #78350f;">Please rate your experience with the resolution of this grievance. Your feedback helps us improve our services.</p>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              Thank you for using GRAMS. We are committed to serving you better!
            </p>
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
