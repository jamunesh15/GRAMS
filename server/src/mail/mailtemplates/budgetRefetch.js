exports.budgetRefetchEmail = (engineerName, requestId, allocatedAmount, spentAmount, refetchedAmount, refetchMessage) => {
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
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
            color: #f59e0b;
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
          .refetch-icon {
            font-size: 48px;
            text-align: center;
            margin: 10px 0 20px 0;
          }
          .amount-summary {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 4px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .amount-summary h3 {
            margin-top: 0;
            color: #92400e;
          }
          .amount-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(251, 191, 36, 0.3);
          }
          .amount-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 18px;
            color: #92400e;
            padding-top: 12px;
            margin-top: 8px;
            border-top: 2px solid #f59e0b;
          }
          .amount-label {
            color: #78350f;
          }
          .amount-value {
            color: #92400e;
            font-weight: 600;
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
          .message-box {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .message-box h4 {
            margin-top: 0;
            color: #1e40af;
          }
          .message-box p {
            margin: 0;
            color: #1e3a8a;
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
            <div class="refetch-icon">💰</div>
            
            <h2 style="color: #f59e0b; margin-top: 0;">Budget Amount Refetched</h2>
            
            <p>Dear <strong>${engineerName}</strong>,</p>
            
            <p>The remaining amount from your resource request has been successfully refetched and returned to the system budget.</p>
            
            <div class="info-box">
              <p><strong>Request ID:</strong> ${requestId}</p>
            </div>
            
            <div class="amount-summary">
              <h3>Budget Summary:</h3>
              <div class="amount-row">
                <span class="amount-label">Allocated Amount:</span>
                <span class="amount-value">₹${allocatedAmount.toLocaleString('en-IN')}</span>
              </div>
              <div class="amount-row">
                <span class="amount-label">Amount Spent:</span>
                <span class="amount-value">₹${spentAmount.toLocaleString('en-IN')}</span>
              </div>
              <div class="amount-row">
                <span class="amount-label">Refetched Amount:</span>
                <span class="amount-value">₹${refetchedAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            ${refetchMessage ? `
            <div class="message-box">
              <h4>📌 Admin Message:</h4>
              <p>${refetchMessage}</p>
            </div>
            ` : ''}
            
            <p style="margin-top: 30px;">The refetched amount has been added back to the operational budget and is now available for other resource allocations.</p>
            
            <p style="margin-top: 20px;">
              Thank you,<br>
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
