const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Grievance = require('../models/Grievance');
const User = require('../models/User');
const { generatePDF } = require('./reportPDFGenerator');

// Helper function to draw a pie chart
function drawPieChart(doc, x, y, radius, data, colors) {
  let currentAngle = 0;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  data.forEach((item, index) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    
    // Draw slice
    doc.save();
    doc.translate(x, y);
    doc.rotate(currentAngle, { origin: [0, 0] });
    
    // Create pie slice path
    doc.moveTo(0, 0);
    doc.lineTo(radius, 0);
    doc.arc(0, 0, radius, 0, sliceAngle);
    doc.lineTo(0, 0);
    doc.fillColor(colors[index % colors.length]);
    doc.fill();
    
    doc.restore();
    
    currentAngle += sliceAngle;
  });
  
  // Draw legend
  let legendY = y + radius + 30;
  data.forEach((item, index) => {
    const percentage = ((item.value / total) * 100).toFixed(1);
    
    // Color box
    doc.rect(x - radius, legendY, 15, 15)
      .fillColor(colors[index % colors.length])
      .fill();
    
    // Label
    doc.fillColor('#000000')
      .fontSize(10)
      .text(`${item.label}: ${item.value} (${percentage}%)`, x - radius + 20, legendY + 2);
    
    legendY += 20;
  });
}

// Helper function to draw a bar chart
function drawBarChart(doc, x, y, width, height, data, color, title) {
  const maxValue = Math.max(...data.map(item => item.value));
  const barWidth = (width - 50) / data.length;
  const chartHeight = height - 60;
  
  // Title
  doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold').text(title, x, y);
  
  // Draw axes
  doc.strokeColor('#000000').lineWidth(1);
  doc.moveTo(x, y + 30).lineTo(x, y + 30 + chartHeight).stroke(); // Y-axis
  doc.moveTo(x, y + 30 + chartHeight).lineTo(x + width, y + 30 + chartHeight).stroke(); // X-axis
  
  // Draw bars
  data.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * chartHeight;
    const barX = x + 30 + (index * barWidth);
    const barY = y + 30 + chartHeight - barHeight;
    
    // Bar
    doc.rect(barX, barY, barWidth - 10, barHeight)
      .fillColor(color)
      .fill();
    
    // Value on top
    doc.fontSize(8).fillColor('#000000')
      .text(item.value.toString(), barX, barY - 12, { width: barWidth - 10, align: 'center' });
    
    // Label
    doc.fontSize(7).fillColor('#000000')
      .text(item.label.substring(0, 10), barX, y + 30 + chartHeight + 5, { 
        width: barWidth - 10, 
        align: 'center',
        lineBreak: false
      });
  });
}

// Helper function to draw horizontal bar chart
function drawHorizontalBarChart(doc, x, y, width, height, data, color, title) {
  const maxValue = Math.max(...data.map(item => item.value));
  const barHeight = 25;
  const chartWidth = width - 150;
  
  // Title
  doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold').text(title, x, y);
  y += 25;
  
  data.forEach((item, index) => {
    const barWidth = (item.value / maxValue) * chartWidth;
    const barY = y + (index * (barHeight + 5));
    
    // Label
    doc.fontSize(9).fillColor('#000000').font('Helvetica')
      .text(item.label.substring(0, 20), x, barY + 7, { width: 140 });
    
    // Bar
    doc.rect(x + 145, barY, barWidth, barHeight)
      .fillColor(color)
      .fill();
    
    // Value
    doc.fontSize(9).fillColor('#000000')
      .text(item.value.toString(), x + 145 + barWidth + 5, barY + 7);
  });
}

// @desc    Generate comprehensive report
// @route   POST /api/reports/generate
// @access  Private/Admin
exports.generateReport = async (req, res) => {
  try {
    const { period } = req.body; // 'weekly', 'monthly', 'quarterly', 'yearly'

    // Calculate date range based on period
    const dateRange = getDateRange(period);
    
    // Fetch all necessary data
    const reportData = await fetchReportData(dateRange);
    
    // Generate PDF using new generator
    const pdfPath = await generatePDF(reportData, period);
    
    // Save report metadata to database (optional)
    const report = {
      period,
      dateRange,
      generatedBy: req.user._id,
      generatedAt: new Date(),
      filePath: pdfPath,
      stats: reportData.summary
    };

    res.status(200).json({
      success: true,
      message: 'Report generated successfully',
      data: {
        reportPath: pdfPath,
        fileName: path.basename(pdfPath),
        summary: reportData.summary
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
};

// @desc    Get report history
// @route   GET /api/reports/history
// @access  Private/Admin
exports.getReportHistory = async (req, res) => {
  try {
    // This would fetch from a Report model if you create one
    // For now, returning sample data
    const reports = [
      {
        id: 1,
        period: 'monthly',
        generatedAt: new Date(),
        fileName: 'report_monthly_2026_01.pdf'
      }
    ];

    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching report history',
      error: error.message
    });
  }
};

// @desc    Download report
// @route   GET /api/reports/download?period=weekly
// @access  Private/Admin
exports.downloadReport = async (req, res) => {
  try {
    const { period } = req.query;
    
    if (!period) {
      return res.status(400).json({
        success: false,
        message: 'Period parameter is required'
      });
    }
    
    // Get most recent report for this period
    const reportsDir = path.join(__dirname, '../../reports');
    
    if (!fs.existsSync(reportsDir)) {
      return res.status(404).json({
        success: false,
        message: 'Reports directory not found'
      });
    }
    
    // Find all reports for this period
    const files = fs.readdirSync(reportsDir);
    const periodFiles = files.filter(file => file.startsWith(`report_${period}_`) && file.endsWith('.pdf'));
    
    if (periodFiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found. Please generate a report first.'
      });
    }
    
    // Get the most recent file
    const latestFile = periodFiles.sort().reverse()[0];
    const filePath = path.join(reportsDir, latestFile);

    res.download(filePath, latestFile);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error downloading report',
      error: error.message
    });
  }
};

// @desc    Get report preview data
// @route   GET /api/reports/preview
// @access  Private/Admin
exports.getReportPreview = async (req, res) => {
  try {
    const { period } = req.query;
    const dateRange = getDateRange(period);
    const reportData = await fetchReportData(dateRange);

    res.status(200).json({
      success: true,
      data: reportData.summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching report preview',
      error: error.message
    });
  }
};

// Helper Functions

function getDateRange(period) {
  const now = new Date();
  let startDate, endDate = now;

  switch (period) {
    case 'weekly':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'monthly':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'quarterly':
      startDate = new Date(now.setMonth(now.getMonth() - 3));
      break;
    case 'yearly':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
  }

  return { startDate, endDate: new Date() };
}

async function fetchReportData(dateRange) {
  const { startDate, endDate } = dateRange;

  // Fetch grievances
  const grievances = await Grievance.find({
    createdAt: { $gte: startDate, $lte: endDate }
  }).populate('assignedTo category');

  // Calculate statistics
  const totalGrievances = grievances.length;
  // Count both 'resolved' and 'closed' as resolved
  const resolved = grievances.filter(g => ['resolved', 'closed'].includes(g.status)).length;
  const inProgress = grievances.filter(g => g.status === 'in-progress').length;
  const pending = grievances.filter(g => g.status === 'open').length;
  const blocked = grievances.filter(g => g.status === 'blocked').length;

  // Resolution time calculation - count both resolved and closed
  const resolvedGrievances = grievances.filter(g => ['resolved', 'closed'].includes(g.status) && g.resolutionDate);
  const avgResolutionTime = resolvedGrievances.length > 0
    ? resolvedGrievances.reduce((sum, g) => {
        const created = new Date(g.createdAt);
        const resolved = new Date(g.resolutionDate);
        const days = (resolved - created) / (1000 * 60 * 60 * 24);
        // Only count positive days (valid resolution times)
        return sum + Math.max(0, days);
      }, 0) / resolvedGrievances.length
    : 0;

  // Category breakdown
  const categoryStats = grievances.reduce((acc, g) => {
    const cat = g.category || 'Others';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // Priority breakdown
  const priorityStats = grievances.reduce((acc, g) => {
    acc[g.priority] = (acc[g.priority] || 0) + 1;
    return acc;
  }, {});

  // Area breakdown
  const areaStats = grievances.reduce((acc, g) => {
    const area = g.ward || 'Others';
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {});

  // Engineer performance
  const engineers = await User.find({ role: 'engineer' });
  const engineerPerformance = await Promise.all(
    engineers.map(async (engineer) => {
      const assigned = await Grievance.countDocuments({
        assignedTo: engineer._id,
        createdAt: { $gte: startDate, $lte: endDate }
      });
      // Count both 'resolved' and 'closed' as resolved
      const resolved = await Grievance.countDocuments({
        assignedTo: engineer._id,
        status: { $in: ['resolved', 'closed'] },
        createdAt: { $gte: startDate, $lte: endDate }
      });
      return {
        name: engineer.name,
        assigned,
        resolved,
        resolutionRate: assigned > 0 ? ((resolved / assigned) * 100).toFixed(1) : 0
      };
    })
  );

  // User engagement
  const totalUsers = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  return {
    summary: {
      dateRange,
      totalGrievances,
      resolved,
      inProgress,
      pending,
      blocked,
      resolutionRate: totalGrievances > 0 ? ((resolved / totalGrievances) * 100).toFixed(1) : 0,
      avgResolutionTime: avgResolutionTime.toFixed(1),
      categoryStats,
      priorityStats,
      areaStats,
      engineerPerformance,
      totalUsers
    },
    grievances,
    dateRange
  };
}

async function generatePDFReport(reportData, period) {
  return new Promise(async (resolve, reject) => {
    try {
      // Create reports directory if it doesn't exist
      const reportsDir = path.join(__dirname, '../../reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const fileName = `report_${period}_${timestamp}.pdf`;
      const filePath = path.join(reportsDir, fileName);

      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      const summary = reportData.summary;
      const pageWidth = doc.page.width - 80;

      // ============ TITLE PAGE ============
      doc.fontSize(28).font('Helvetica-Bold').fillColor('#4f46e5')
        .text('GRAMS', { align: 'center' });
      
      doc.fontSize(18).fillColor('#000000')
        .text('Grievance Redressal And Management System', { align: 'center' });
      
      doc.moveDown(2);
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#6366f1')
        .text(`${period.charAt(0).toUpperCase() + period.slice(1)} Report`, { align: 'center' });

      doc.moveDown();
      doc.fontSize(12).font('Helvetica').fillColor('#000000')
        .text(`Period: ${new Date(reportData.dateRange.startDate).toLocaleDateString()} - ${new Date(reportData.dateRange.endDate).toLocaleDateString()}`, 
          { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(10).fillColor('#666666')
        .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });

      doc.moveDown(3);
      doc.moveTo(100, doc.y).lineTo(500, doc.y).lineWidth(2).strokeColor('#4f46e5').stroke();
      doc.moveDown(2);

      // ============ EXECUTIVE SUMMARY ============
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#4f46e5')
        .text('📊 Executive Summary');
      doc.moveDown();

      // Summary boxes with color coding
      const summaryY = doc.y;
      const boxWidth = 230;
      const boxHeight = 70;
      const gap = 20;

      // Box 1: Total Grievances
      doc.rect(60, summaryY, boxWidth, boxHeight)
        .fillAndStroke('#dbeafe', '#3b82f6');
      doc.fontSize(12).fillColor('#1e40af').font('Helvetica-Bold')
        .text('Total Grievances', 70, summaryY + 15);
      doc.fontSize(32).fillColor('#1e3a8a')
        .text(summary.totalGrievances.toString(), 70, summaryY + 35);

      // Box 2: Resolved
      doc.rect(60 + boxWidth + gap, summaryY, boxWidth, boxHeight)
        .fillAndStroke('#d1fae5', '#10b981');
      doc.fontSize(12).fillColor('#047857').font('Helvetica-Bold')
        .text('Resolved', 70 + boxWidth + gap, summaryY + 15);
      doc.fontSize(32).fillColor('#065f46')
        .text(summary.resolved.toString(), 70 + boxWidth + gap, summaryY + 35);
      doc.fontSize(14).fillColor('#059669')
        .text(`${summary.resolutionRate}%`, 70 + boxWidth + gap + 100, summaryY + 45);

      // Box 3: In Progress
      doc.rect(60, summaryY + boxHeight + gap, boxWidth, boxHeight)
        .fillAndStroke('#fef3c7', '#f59e0b');
      doc.fontSize(12).fillColor('#b45309').font('Helvetica-Bold')
        .text('In Progress', 70, summaryY + boxHeight + gap + 15);
      doc.fontSize(32).fillColor('#92400e')
        .text(summary.inProgress.toString(), 70, summaryY + boxHeight + gap + 35);

      // Box 4: Pending & Blocked
      doc.rect(60 + boxWidth + gap, summaryY + boxHeight + gap, boxWidth, boxHeight)
        .fillAndStroke('#fee2e2', '#ef4444');
      doc.fontSize(12).fillColor('#b91c1c').font('Helvetica-Bold')
        .text('Pending / Blocked', 70 + boxWidth + gap, summaryY + boxHeight + gap + 15);
      doc.fontSize(24).fillColor('#991b1b')
        .text(`${summary.pending} / ${summary.blocked}`, 70 + boxWidth + gap, summaryY + boxHeight + gap + 35);

      doc.moveDown(12);

      // Additional metrics
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000')
        .text(`⏱️  Average Resolution Time: ${summary.avgResolutionTime} days`);
      doc.moveDown(0.5);
      doc.fontSize(14)
        .text(`👥 New Users: ${summary.totalUsers}`);
      doc.moveDown(2);

      // ============ KEY INSIGHTS ============
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#4f46e5')
        .text('💡 Key Insights');
      doc.moveDown();
      
      doc.fontSize(11).font('Helvetica').fillColor('#000000');
      
      const resolutionRate = parseFloat(summary.resolutionRate);
      const insight1 = resolutionRate > 80 ? '✓ Excellent resolution rate - keep up the good work!' 
        : resolutionRate > 60 ? '⚠ Good resolution rate with room for improvement.' 
        : '⚠ Resolution rate needs attention - consider resource allocation.';
      doc.text(insight1, { indent: 20 });
      doc.moveDown(0.5);
      
      const avgTime = parseFloat(summary.avgResolutionTime);
      const insight2 = avgTime < 3 ? '✓ Outstanding average resolution time!' 
        : avgTime < 7 ? '⚠ Moderate resolution time - within acceptable range.' 
        : '⚠ High resolution time - process improvements recommended.';
      doc.text(insight2, { indent: 20 });
      doc.moveDown(0.5);
      
      const topCategory = Object.entries(summary.categoryStats).sort((a, b) => b[1] - a[1])[0];
      if (topCategory) {
        doc.text(`✓ Most common category: "${topCategory[0]}" with ${topCategory[1]} cases`, { indent: 20 });
      }
      doc.moveDown(0.5);
      
      const topArea = Object.entries(summary.areaStats).sort((a, b) => b[1] - a[1])[0];
      if (topArea) {
        doc.text(`✓ Most affected area: "${topArea[0]}" with ${topArea[1]} cases`, { indent: 20 });
      }

      // ============ NEW PAGE: STATUS DISTRIBUTION ============
      doc.addPage();
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#4f46e5')
        .text('📊 Visual Analytics');
      doc.moveDown(2);

      // Status Distribution Pie Chart
      doc.fontSize(16).fillColor('#000000').text('Status Distribution');
      doc.moveDown();

      const statusData = [
        { label: 'Resolved', value: summary.resolved },
        { label: 'In Progress', value: summary.inProgress },
        { label: 'Pending', value: summary.pending },
        { label: 'Blocked', value: summary.blocked }
      ].filter(item => item.value > 0);

      const statusColors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];
      
      if (statusData.length > 0) {
        drawPieChart(doc, 300, 250, 100, statusData, statusColors);
      }

      // ============ NEW PAGE: CATEGORY BREAKDOWN ============
      if (Object.keys(summary.categoryStats).length > 0) {
        doc.addPage();
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#4f46e5')
          .text('Category Breakdown');
        doc.moveDown(2);

        const categoryData = Object.entries(summary.categoryStats)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 8)
          .map(([label, value]) => ({ label, value }));

        drawBarChart(doc, 60, doc.y, 480, 300, categoryData, '#8b5cf6', 'Grievances by Category');
      }

      // ============ NEW PAGE: PRIORITY DISTRIBUTION ============
      if (Object.keys(summary.priorityStats).length > 0) {
        doc.addPage();
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#4f46e5')
          .text('Priority Distribution');
        doc.moveDown(2);

        const priorityData = Object.entries(summary.priorityStats)
          .map(([label, value]) => ({ 
            label: label.charAt(0).toUpperCase() + label.slice(1), 
            value 
          }));

        const priorityColors = ['#ef4444', '#f59e0b', '#10b981'];
        drawPieChart(doc, 300, 250, 100, priorityData, priorityColors);
      }

      // ============ NEW PAGE: AREA DISTRIBUTION ============
      if (Object.keys(summary.areaStats).length > 0) {
        doc.addPage();
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#4f46e5')
          .text('Area-wise Distribution');
        doc.moveDown(2);

        const topAreas = Object.entries(summary.areaStats)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([label, value]) => ({ label, value }));

        drawHorizontalBarChart(doc, 60, doc.y, 480, 300, topAreas, '#3b82f6', 'Top 10 Areas by Grievances');
      }

      // ============ NEW PAGE: ENGINEER PERFORMANCE ============
      doc.addPage();
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#4f46e5')
        .text('👷 Engineer Performance');
      doc.moveDown(2);

      if (summary.engineerPerformance && summary.engineerPerformance.length > 0) {
        // Performance chart
        const topEngineers = summary.engineerPerformance
          .sort((a, b) => b.resolved - a.resolved)
          .slice(0, 8);

        const engineerData = topEngineers.map(e => ({
          label: e.name.split(' ')[0], // First name only
          value: e.resolved
        }));

        drawBarChart(doc, 60, doc.y, 480, 300, engineerData, '#10b981', 'Top Engineers by Resolved Cases');

        // Detailed metrics table
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#4f46e5')
          .text('Detailed Engineer Metrics');
        doc.moveDown();

        doc.fontSize(11).font('Helvetica').fillColor('#000000');
        
        summary.engineerPerformance.slice(0, 15).forEach((engineer, index) => {
          const rate = parseFloat(engineer.resolutionRate);
          const bgColor = rate >= 80 ? '#d1fae5' : rate >= 60 ? '#fef3c7' : '#fee2e2';
          const textColor = rate >= 80 ? '#065f46' : rate >= 60 ? '#92400e' : '#991b1b';
          
          const yPos = doc.y;
          
          // Background box
          doc.rect(60, yPos, 480, 45).fillAndStroke(bgColor, '#cccccc');
          
          doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000')
            .text(`${index + 1}. ${engineer.name}`, 70, yPos + 8);
          
          doc.fontSize(10).font('Helvetica').fillColor('#666666')
            .text(`Assigned: ${engineer.assigned} | Resolved: ${engineer.resolved} | Rate: ${engineer.resolutionRate}%`, 
              70, yPos + 25);
          
          // Performance indicator
          const indicator = rate >= 80 ? '⭐ Excellent' : rate >= 60 ? '✓ Good' : '⚠ Improve';
          doc.fontSize(10).fillColor(textColor)
            .text(indicator, 450, yPos + 15);

          doc.moveDown(3);

          // Page break if needed
          if (doc.y > 700 && index < summary.engineerPerformance.length - 1) {
            doc.addPage();
          }
        });
      }

      // ============ RECOMMENDATIONS PAGE ============
      doc.addPage();
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#4f46e5')
        .text('💡 Recommendations & Action Items');
      doc.moveDown(2);
      
      doc.fontSize(12).font('Helvetica').fillColor('#000000');

      const recommendations = [];
      
      if (resolutionRate < 70) {
        recommendations.push({
          priority: 'HIGH',
          text: 'Focus on improving resolution rate by allocating more resources to pending grievances.',
          color: '#ef4444'
        });
      }
      
      if (avgTime > 7) {
        recommendations.push({
          priority: 'HIGH',
          text: 'Reduce average resolution time by streamlining processes and prioritizing high-priority cases.',
          color: '#ef4444'
        });
      }
      
      if (summary.blocked > 0) {
        recommendations.push({
          priority: 'MEDIUM',
          text: `Address ${summary.blocked} blocked grievances to improve overall efficiency.`,
          color: '#f59e0b'
        });
      }

      if (topCategory && topCategory[1] > summary.totalGrievances * 0.3) {
        recommendations.push({
          priority: 'MEDIUM',
          text: `High concentration in "${topCategory[0]}" category (${topCategory[1]} cases) - consider specialized training or resources.`,
          color: '#f59e0b'
        });
      }

      if (topArea && topArea[1] > summary.totalGrievances * 0.2) {
        recommendations.push({
          priority: 'MEDIUM',
          text: `"${topArea[0]}" area shows high grievance volume (${topArea[1]} cases) - may need additional attention.`,
          color: '#f59e0b'
        });
      }

      if (summary.inProgress > summary.totalGrievances * 0.4) {
        recommendations.push({
          priority: 'LOW',
          text: 'High number of in-progress cases - monitor to ensure timely completion.',
          color: '#10b981'
        });
      }

      if (recommendations.length === 0) {
        doc.fontSize(12).fillColor('#10b981')
          .text('✓ Overall performance is excellent! Continue current practices and monitor trends.', { indent: 20 });
      } else {
        recommendations.forEach((rec, index) => {
          const yPos = doc.y;
          
          // Priority badge
          doc.rect(70, yPos, 80, 20).fillAndStroke(rec.color, rec.color);
          doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff')
            .text(rec.priority, 75, yPos + 5);
          
          // Recommendation text
          doc.fontSize(11).font('Helvetica').fillColor('#000000')
            .text(`${index + 1}. ${rec.text}`, 160, yPos + 2, { width: 370 });
          
          doc.moveDown(2);
        });
      }

      // ============ FOOTER ============
      const range = doc.bufferedPageRange();
      const pageCount = range.count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(range.start + i);
        doc.fontSize(8).font('Helvetica').fillColor('#666666')
          .text(
            `Generated by GRAMS | Page ${i + 1} of ${pageCount}`,
            50,
            doc.page.height - 40,
            { align: 'center', width: doc.page.width - 100 }
          );
      }

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

// @desc    Get recent reports (last 4)
// @route   GET /api/reports/recent
// @access  Private/Admin
exports.getRecentReports = async (req, res) => {
  try {
    const reportsDir = path.join(__dirname, '../../reports');
    
    if (!fs.existsSync(reportsDir)) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    // Get all PDF files
    const files = fs.readdirSync(reportsDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    
    // Get file stats and sort by creation time (newest first)
    const filesWithStats = pdfFiles.map(file => {
      const filePath = path.join(reportsDir, file);
      const stats = fs.statSync(filePath);
      
      // Extract period from filename (format: report_period_timestamp.pdf)
      const match = file.match(/report_(\w+)_(\d+)\.pdf/);
      const period = match ? match[1] : 'unknown';
      const timestamp = match ? parseInt(match[2]) : stats.birthtimeMs;
      
      return {
        fileName: file,
        period: period.charAt(0).toUpperCase() + period.slice(1),
        generatedAt: new Date(timestamp),
        size: stats.size,
        filePath: `/api/reports/download-file/${file}`
      };
    });
    
    // Sort by date and get last 4
    const recentReports = filesWithStats
      .sort((a, b) => b.generatedAt - a.generatedAt)
      .slice(0, 4);
    
    res.status(200).json({
      success: true,
      data: recentReports
    });
  } catch (error) {
    console.error('Error fetching recent reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent reports',
      error: error.message
    });
  }
};

// @desc    Download report by filename
// @route   GET /api/reports/download-file/:filename
// @access  Private/Admin
exports.downloadReportByFilename = async (req, res) => {
  try {
    const { filename } = req.params;
    const reportsDir = path.join(__dirname, '../../reports');
    const filePath = path.join(reportsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Report file not found'
      });
    }
    
    res.download(filePath, filename);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error downloading report',
      error: error.message
    });
  }
};
