exports.profileUpdatedEmail = (engineerName, updates) => {
  const { specialization, department, phone, email, isActive } = updates;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .logo {
            display: inline-block;
            width: 50px;
            height: 50px;
            background: white;
            border-radius: 50%;
            line-height: 50px;
            font-size: 28px;
            font-weight: bold;
            color: #4f46e5;
            margin-bottom: 15px;
          }
          .header h1 {
            margin: 10px 0 5px 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 0;
            font-size: 14px;
            opacity: 0.95;
          }
          .content {
            padding: 30px;
          }
          .update-icon {
            font-size: 48px;
            text-align: center;
            margin: 10px 0 20px 0;
          }
          .updates-box {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #4f46e5;
          }
          .updates-box h3 {
            margin-top: 0;
            color: #1f2937;
          }
          .updates-box p {
            margin: 8px 0;
            font-size: 15px;
          }
          .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">G</div>
            <h1>GRAMS</h1>
            <p>Grievance Management System</p>
          </div>
          
          <div class="content">
            <div class="update-icon">⚙️</div>
            
            <h2 style="color: #4f46e5; margin-top: 0;">Profile Updated</h2>
            
            <p>Hello <strong>${engineerName}</strong>,</p>
            
            <p>Your engineer profile has been updated by the administrator.</p>
            
            <div class="updates-box">
              <h3>Updated Information:</h3>
              ${specialization ? `<p><strong>Specialization:</strong> ${specialization}</p>` : ''}
              ${department ? `<p><strong>Department:</strong> ${department}</p>` : ''}
              ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
              ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
              ${typeof isActive === 'boolean' ? `<p><strong>Status:</strong> ${isActive ? '<span style="color: #10b981;">✓ Active</span>' : '<span style="color: #ef4444;">✗ Inactive</span>'}</p>` : ''}
            </div>
            
            <p>If you have any questions about these changes, please contact the administrator.</p>
            
            <p style="margin-top: 20px;">
              Best regards,<br>
              <strong>GRAMS Team</strong><br>
              Grievance Management System
            </p>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from GRAMS.</p>
            <p>© ${new Date().getFullYear()} GRAMS. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
