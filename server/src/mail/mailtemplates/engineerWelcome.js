exports.engineerWelcomeEmail = (name, engineerId, email, password, specialization) => {
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
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
            color: #10b981;
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
          .welcome-icon {
            font-size: 48px;
            text-align: center;
            margin: 10px 0 20px 0;
          }
          .credentials-box {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-left: 4px solid #10b981;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .credentials-box h3 {
            margin-top: 0;
            color: #065f46;
          }
          .credentials-box p {
            margin: 10px 0;
            font-size: 15px;
          }
          .alert-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .alert-box strong {
            color: #92400e;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
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
            <div class="welcome-icon">👋</div>
            
            <h2 style="color: #10b981; margin-top: 0;">Welcome to GRAMS Engineer Portal!</h2>
            
            <p>Dear <strong>${name}</strong>,</p>
            
            <p>You have been successfully registered as an engineer in the GRAMS system. We're excited to have you join our team!</p>
            
            <div class="credentials-box">
              <h3>Your Login Credentials:</h3>
              <p><strong>Engineer ID:</strong> ${engineerId}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> ${password}</p>
              <p><strong>Specialization:</strong> ${specialization || 'General'}</p>
            </div>
            
            <div class="alert-box">
              <strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.
            </div>
            
            <div style="text-align: center;">
              <a href="http://localhost:5173/login" class="button">Access GRAMS Portal</a>
            </div>
            
            <p style="margin-top: 30px;">If you have any questions or need assistance, please contact the administrator.</p>
            
            <p style="margin-top: 20px;">
              Best regards,<br>
              <strong>GRAMS Admin Team</strong><br>
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
