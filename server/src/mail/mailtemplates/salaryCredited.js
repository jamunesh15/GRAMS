exports.salaryCreditedEmail = (engineerName, month, year, amount) => {
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
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 30px;
          }
          .salary-card {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .salary-amount {
            font-size: 36px;
            font-weight: bold;
            color: #059669;
            margin: 10px 0;
          }
          .salary-period {
            font-size: 18px;
            color: #065f46;
            margin: 5px 0;
          }
          .info-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .info-box p {
            margin: 8px 0;
            font-size: 14px;
          }
          .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
          }
          .success-icon {
            font-size: 48px;
            text-align: center;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="display: inline-block; width: 50px; height: 50px; background: white; border-radius: 50%; line-height: 50px; font-size: 28px; font-weight: bold; color: #10b981; margin-bottom: 15px;">G</div>
            <h1 style="margin: 10px 0 5px 0;">GRAMS</h1>
            <p style="margin: 0; font-size: 14px; opacity: 0.95;">Grievance Management System</p>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3);">
              <h2 style="margin: 0; font-size: 22px;">💰 Salary Credited</h2>
            </div>
          </div>
          
          <div class="content">
            <div class="success-icon">✅</div>
            
            <p>Dear <strong>${engineerName}</strong>,</p>
            
            <p>We are pleased to inform you that your monthly salary has been credited successfully.</p>
            
            <div class="salary-card">
              <div class="salary-period">Salary for ${month} ${year}</div>
              <div class="salary-amount">₹${amount.toLocaleString('en-IN')}</div>
            </div>
            
            <div class="info-box">
              <p><strong>📅 Payment Date:</strong> ${new Date().toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}</p>
              <p><strong>💳 Payment Status:</strong> <span style="color: #10b981; font-weight: 600;">Credited Successfully</span></p>
              <p><strong>🏢 Department:</strong> GRAMS Engineering Department</p>
            </div>
            
            <p>The amount has been processed and should reflect in your account shortly.</p>
            
            <p style="margin-top: 20px;">If you have any questions or concerns regarding your salary, please contact the admin department.</p>
            
            <p style="margin-top: 20px;">
              Thank you for your continued dedication and service!
            </p>
            
            <p style="margin-top: 20px;">
              Best regards,<br>
              <strong>GRAMS Admin Team</strong><br>
              Grievance Redressal and Management System
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
