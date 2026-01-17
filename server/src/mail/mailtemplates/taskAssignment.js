exports.taskAssignmentEmail = (engineerName, grievance, instructions = null) => {
  const priorityColor = grievance.priority === 'high' ? '#EF4444' : grievance.priority === 'medium' ? '#F59E0B' : '#10B981';
  const priorityBg = grievance.priority === 'high' ? '#FEE2E2' : grievance.priority === 'medium' ? '#FEF3C7' : '#D1FAE5';
  
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
          .task-icon {
            font-size: 48px;
            text-align: center;
            margin: 10px 0 20px 0;
          }
          .instructions-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .instructions-box h3 {
            margin-top: 0;
            color: #92400e;
          }
          .instructions-box p {
            margin: 0;
            color: #78350f;
          }
          .task-details {
            background: #f9fafb;
            padding: 20px;
            border-left: 4px solid #4f46e5;
            margin: 20px 0;
            border-radius: 8px;
          }
          .task-details h3 {
            margin-top: 0;
            color: #1f2937;
          }
          .task-details p {
            margin: 8px 0;
            font-size: 15px;
          }
          .priority-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
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
            <div class="task-icon">📋</div>
            
            <h2 style="color: #4f46e5; margin-top: 0;">New Task Assigned</h2>
            
            <p>Hello <strong>${engineerName}</strong>,</p>
            
            <p>You have been assigned a new task by the administrator.</p>
            
            ${instructions ? `
            <div class="instructions-box">
              <h3>📌 Admin Instructions:</h3>
              <p>${instructions}</p>
            </div>
            ` : ''}
            
            <div class="task-details">
              <h3>Task Details:</h3>
              <p><strong>Tracking ID:</strong> ${grievance.trackingId}</p>
              <p><strong>Title:</strong> ${grievance.title}</p>
              <p><strong>Description:</strong> ${grievance.description}</p>
              <p><strong>Category:</strong> ${grievance.category}</p>
              <p><strong>Priority:</strong> <span class="priority-badge" style="background-color: ${priorityBg}; color: ${priorityColor};">${grievance.priority.toUpperCase()}</span></p>
              <p><strong>Location:</strong> ${grievance.location}</p>
            </div>
            
            <p style="margin-top: 30px;">Please log in to your dashboard to view complete details and start working on this task.</p>
            
            <div style="text-align: center;">
              <a href="http://localhost:5173/login" class="button">Open Dashboard</a>
            </div>
            
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
