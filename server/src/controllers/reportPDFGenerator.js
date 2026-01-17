const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Constants for layout
const PAGE_MARGIN = 50;
const PAGE_HEIGHT = 841.89; // A4 height in points
const PAGE_WIDTH = 595.28;  // A4 width in points
const FOOTER_HEIGHT = 60;
const USABLE_HEIGHT = PAGE_HEIGHT - FOOTER_HEIGHT;

// Helper function to draw pie chart with legend
function drawPieChartWithLegend(doc, centerX, centerY, radius, data, colors) {
  let currentAngle = 0;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) return centerY + radius + 20;
  
  // Draw pie slices
  data.forEach((item, index) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    
    doc.save();
    doc.translate(centerX, centerY);
    doc.rotate(currentAngle, { origin: [0, 0] });
    
    doc.moveTo(0, 0);
    doc.lineTo(radius, 0);
    doc.arc(0, 0, radius, 0, sliceAngle);
    doc.lineTo(0, 0);
    doc.fillColor(colors[index % colors.length]);
    doc.fill();
    
    doc.restore();
    currentAngle += sliceAngle;
  });
  
  // Draw legend below the pie chart
  let legendY = centerY + radius + 25;
  const legendX = centerX - radius - 10;
  
  data.forEach((item, index) => {
    const percentage = ((item.value / total) * 100).toFixed(1);
    
    // Color box
    doc.rect(legendX, legendY, 12, 12)
      .fillColor(colors[index % colors.length])
      .fill();
    
    // Label text
    doc.fillColor('#1f2937')
      .fontSize(9)
      .font('Helvetica')
      .text(`${item.label}: ${item.value} (${percentage}%)`, legendX + 18, legendY + 2, { width: 250 });
    
    legendY += 20;
  });
  
  // Return the Y position after the legend
  return legendY + 10;
}

// Helper function to check if we need a new page
function checkPageBreak(doc, currentY, requiredSpace) {
  if (currentY + requiredSpace > USABLE_HEIGHT) {
    doc.addPage();
    return 50; // Return new starting Y position
  }
  return currentY;
}

// Helper function to draw bar chart
function drawBarChart(doc, x, y, width, height, data, color) {
  if (data.length === 0) return y + height;
  
  const maxValue = Math.max(...data.map(item => item.value));
  const barWidth = Math.min(50, (width - 40) / data.length);
  const chartHeight = height - 50;
  const spacing = (width - (barWidth * data.length)) / (data.length + 1);
  
  // Y-axis
  doc.strokeColor('#d1d5db').lineWidth(1);
  doc.moveTo(x, y).lineTo(x, y + chartHeight).stroke();
  
  // X-axis
  doc.moveTo(x, y + chartHeight).lineTo(x + width, y + chartHeight).stroke();
  
  // Bars
  data.forEach((item, index) => {
    const barHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
    const barX = x + spacing + (index * (barWidth + spacing));
    const barY = y + chartHeight - barHeight;
    
    // Bar rectangle
    doc.rect(barX, barY, barWidth, barHeight)
      .fillColor(color)
      .fill();
    
    // Value on top
    if (item.value > 0) {
      doc.fontSize(8).fillColor('#1f2937').font('Helvetica-Bold')
        .text(item.value.toString(), barX, barY - 14, { width: barWidth, align: 'center' });
    }
    
    // Label below
    doc.fontSize(8).fillColor('#6b7280').font('Helvetica')
      .text(item.label.substring(0, 10), barX - 10, y + chartHeight + 5, { 
        width: barWidth + 20, 
        align: 'center'
      });
  });
  
  return y + chartHeight + 35;
}

// Helper function to draw horizontal bar chart
function drawHorizontalBarChart(doc, x, y, width, height, data, color) {
  if (data.length === 0) return y + height;
  
  const maxValue = Math.max(...data.map(item => item.value));
  const barHeight = 22;
  const chartWidth = width - 120;
  const spacing = 6;
  
  data.forEach((item, index) => {
    const barWidth = maxValue > 0 ? (item.value / maxValue) * chartWidth : 0;
    const barY = y + (index * (barHeight + spacing));
    
    // Label on left
    doc.fontSize(9).fillColor('#1f2937').font('Helvetica')
      .text(item.label.substring(0, 18), x, barY + 6, { width: 110, align: 'left' });
    
    // Bar
    doc.rect(x + 115, barY, barWidth, barHeight)
      .fillColor(color)
      .fill();
    
    // Value on right
    if (item.value > 0) {
      doc.fontSize(9).fillColor('#1f2937').font('Helvetica-Bold')
        .text(item.value.toString(), x + 115 + barWidth + 8, barY + 6);
    }
  });
  
  return y + (data.length * (barHeight + spacing)) + 10;
}

async function generatePDF(reportData, period) {
  return new Promise(async (resolve, reject) => {
    try {
      const reportsDir = path.join(__dirname, '../../reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const fileName = `report_${period}_${timestamp}.pdf`;
      const filePath = path.join(reportsDir, fileName);

      const doc = new PDFDocument({ 
        margin: 50, 
        size: 'A4',
        bufferPages: true
      });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      const summary = reportData.summary;
      const pageWidth = doc.page.width - 100;
      const leftMargin = 50;
      const rightMargin = 50;
      const pageHeight = doc.page.height;

      // ============ HEADER ============
      doc.rect(0, 0, doc.page.width, 90).fillAndStroke('#4f46e5', '#4f46e5');
      
      doc.fontSize(32).font('Helvetica-Bold').fillColor('#ffffff')
        .text('GRAMS', leftMargin, 25);
      
      doc.fontSize(11).font('Helvetica').fillColor('#e0e7ff')
        .text('Grievance Redressal And Management System', leftMargin, 62);

      // Right side info
      doc.fontSize(11).fillColor('#ffffff').font('Helvetica-Bold')
        .text(`${period.toUpperCase()} REPORT`, doc.page.width - 200, 25, { width: 150, align: 'right' });
      
      doc.fontSize(9).fillColor('#c7d2fe').font('Helvetica')
        .text(`${new Date(reportData.dateRange.startDate).toLocaleDateString()} - ${new Date(reportData.dateRange.endDate).toLocaleDateString()}`, 
          doc.page.width - 200, 48, { width: 150, align: 'right' });
      
      doc.fontSize(8).fillColor('#a5b4fc')
        .text(`Generated: ${new Date().toLocaleString()}`, doc.page.width - 200, 68, { width: 150, align: 'right' });

      let currentY = 120;

      // ============ EXECUTIVE SUMMARY ============
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#111827')
        .text('Executive Summary', leftMargin, currentY);
      
      currentY += 30;

      // Summary boxes - 2x2 grid
      const boxWidth = (pageWidth - 20) / 2;
      const boxHeight = 65;
      const boxGap = 20;

      // Row 1
      doc.rect(leftMargin, currentY, boxWidth, boxHeight).fillAndStroke('#eff6ff', '#3b82f6');
      doc.fontSize(9).fillColor('#1e40af').font('Helvetica-Bold')
        .text('TOTAL GRIEVANCES', leftMargin + 12, currentY + 12);
      doc.fontSize(32).fillColor('#1e3a8a')
        .text(summary.totalGrievances.toString(), leftMargin + 12, currentY + 32);

      doc.rect(leftMargin + boxWidth + boxGap, currentY, boxWidth, boxHeight).fillAndStroke('#d1fae5', '#10b981');
      doc.fontSize(9).fillColor('#047857').font('Helvetica-Bold')
        .text('RESOLVED', leftMargin + boxWidth + boxGap + 12, currentY + 12);
      doc.fontSize(32).fillColor('#065f46')
        .text(summary.resolved.toString(), leftMargin + boxWidth + boxGap + 12, currentY + 32);
      doc.fontSize(14).fillColor('#059669')
        .text(`${summary.resolutionRate}%`, leftMargin + boxWidth + boxGap + 100, currentY + 42);

      currentY += boxHeight + 12;

      // Row 2
      doc.rect(leftMargin, currentY, boxWidth, boxHeight).fillAndStroke('#fef3c7', '#f59e0b');
      doc.fontSize(9).fillColor('#b45309').font('Helvetica-Bold')
        .text('IN PROGRESS', leftMargin + 12, currentY + 12);
      doc.fontSize(32).fillColor('#92400e')
        .text(summary.inProgress.toString(), leftMargin + 12, currentY + 32);

      doc.rect(leftMargin + boxWidth + boxGap, currentY, boxWidth, boxHeight).fillAndStroke('#fee2e2', '#ef4444');
      doc.fontSize(9).fillColor('#b91c1c').font('Helvetica-Bold')
        .text('PENDING / BLOCKED', leftMargin + boxWidth + boxGap + 12, currentY + 12);
      doc.fontSize(24).fillColor('#991b1b')
        .text(`${summary.pending} / ${summary.blocked}`, leftMargin + boxWidth + boxGap + 12, currentY + 35);

      currentY += boxHeight + 20;

      // Quick stats bar
      doc.fontSize(10).font('Helvetica').fillColor('#4b5563')
        .text(`Average Resolution Time: ${summary.avgResolutionTime} days  |  New Users: ${summary.totalUsers}`, 
          leftMargin, currentY);
      
      currentY += 35;

      // ============ KEY INSIGHTS ============
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#111827')
        .text('Key Insights', leftMargin, currentY);
      
      currentY += 25;

      const resolutionRate = parseFloat(summary.resolutionRate);
      const avgTime = parseFloat(summary.avgResolutionTime);
      const topCategory = Object.entries(summary.categoryStats).sort((a, b) => b[1] - a[1])[0];
      const topArea = Object.entries(summary.areaStats).sort((a, b) => b[1] - a[1])[0];
      
      const insights = [];
      if (resolutionRate > 80) {
        insights.push({ icon: '+', text: 'Excellent resolution rate - performance is outstanding', color: '#10b981' });
      } else if (resolutionRate > 60) {
        insights.push({ icon: '*', text: 'Good resolution rate with room for improvement', color: '#f59e0b' });
      } else {
        insights.push({ icon: '!', text: 'Resolution rate needs attention - resource allocation required', color: '#ef4444' });
      }
      
      if (avgTime < 3) {
        insights.push({ icon: '+', text: 'Outstanding average resolution time', color: '#10b981' });
      } else if (avgTime >= 7) {
        insights.push({ icon: '!', text: 'High resolution time - process improvements needed', color: '#ef4444' });
      }
      
      if (topCategory) {
        insights.push({ icon: '*', text: `Top category: "${topCategory[0]}" with ${topCategory[1]} cases`, color: '#6366f1' });
      }
      
      if (topArea) {
        insights.push({ icon: '*', text: `Most affected area: "${topArea[0]}" with ${topArea[1]} cases`, color: '#6366f1' });
      }

      insights.forEach(insight => {
        doc.fontSize(10).fillColor(insight.color).font('Helvetica-Bold')
          .text(insight.icon, leftMargin + 5, currentY);
        
        doc.fillColor('#374151').font('Helvetica')
          .text(insight.text, leftMargin + 20, currentY, { width: pageWidth - 20 });
        
        currentY += 18;
      });

      currentY += 20;

      // ============ VISUAL ANALYTICS ============
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#111827')
        .text('Visual Analytics', leftMargin, currentY);
      
      currentY += 30;

      // Chart 1: Status Distribution
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#374151')
        .text('Status Distribution', leftMargin, currentY);
      
      currentY += 20;
      
      const statusData = [
        { label: 'Resolved', value: summary.resolved },
        { label: 'In Progress', value: summary.inProgress },
        { label: 'Pending', value: summary.pending },
        { label: 'Blocked', value: summary.blocked }
      ].filter(item => item.value > 0);

      const statusColors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];
      const chartCenterX = leftMargin + 150;
      currentY = drawPieChartWithLegend(doc, chartCenterX, currentY + 60, 60, statusData, statusColors);
      
      currentY += 30;

      // ============ PRIORITY DISTRIBUTION ============
      if (Object.keys(summary.priorityStats).length > 0) {
        // Check if we need a new page - need at least 200px for chart
        if (currentY > pageHeight - 250) {
          doc.addPage();
          currentY = 50;
        }

        doc.fontSize(14).font('Helvetica-Bold').fillColor('#374151')
          .text('Priority Levels', leftMargin, currentY);
        
        currentY += 20;
        
        const priorityData = Object.entries(summary.priorityStats)
          .map(([label, value]) => ({ 
            label: label.charAt(0).toUpperCase() + label.slice(1), 
            value 
          }));

        const priorityColors = ['#ef4444', '#f59e0b', '#10b981'];
        currentY = drawPieChartWithLegend(doc, chartCenterX, currentY + 60, 60, priorityData, priorityColors);
        
        currentY += 30;
      }

      // ============ CATEGORY DISTRIBUTION ============
      if (Object.keys(summary.categoryStats).length > 0) {
        // Check if we need a new page - need at least 200px for chart
        if (currentY > pageHeight - 250) {
          doc.addPage();
          currentY = 50;
        }

        doc.fontSize(14).font('Helvetica-Bold').fillColor('#374151')
          .text('Top Categories', leftMargin, currentY);
        
        currentY += 20;
        
        const categoryData = Object.entries(summary.categoryStats)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([label, value]) => ({ label, value }));

        const categoryColors = ['#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6'];
        currentY = drawPieChartWithLegend(doc, chartCenterX, currentY + 60, 60, categoryData, categoryColors);
        
        currentY += 30;
      }

      // ============ FORCE PAGE BREAK BEFORE ENGINEER PERFORMANCE ============
      // Start Engineer Performance on a new page for better layout
      doc.addPage();
      currentY = 50;

      // ============ ENGINEER PERFORMANCE ============
      if (summary.engineerPerformance && summary.engineerPerformance.length > 0) {
        const topEngineers = summary.engineerPerformance
          .filter(eng => eng.assigned > 0 || eng.resolved > 0)
          .sort((a, b) => b.resolved - a.resolved)
          .slice(0, 10);

        doc.fontSize(18).font('Helvetica-Bold').fillColor('#111827')
          .text('Engineer Performance', leftMargin, currentY);
        
        currentY += 35;

        topEngineers.forEach((engineer, index) => {
          const rate = parseFloat(engineer.resolutionRate);
          const bgColor = rate >= 80 ? '#d1fae5' : rate >= 60 ? '#fef3c7' : '#fee2e2';
          const borderColor = rate >= 80 ? '#10b981' : rate >= 60 ? '#f59e0b' : '#ef4444';
          
          const rowHeight = 42;
          
          // Check if we need a new page for this row
          if (currentY + rowHeight > pageHeight - 60) {
            doc.addPage();
            currentY = 50;
          }
          
          // Background box
          doc.rect(leftMargin, currentY, pageWidth, rowHeight)
            .fillAndStroke(bgColor, borderColor);
          
          // Engineer number and name
          doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827')
            .text(`${index + 1}. ${engineer.name}`, leftMargin + 15, currentY + 15, { width: 200 });
          
          // Stats
          doc.fontSize(10).font('Helvetica').fillColor('#4b5563')
            .text(`Assigned: ${engineer.assigned}`, leftMargin + 230, currentY + 16);
          
          doc.text(`Resolved: ${engineer.resolved}`, leftMargin + 340, currentY + 16);
          
          doc.text(`Rate: ${engineer.resolutionRate}%`, leftMargin + 440, currentY + 16);

          currentY += rowHeight + 8;
        });

        currentY += 30;
      }

      // ============ RECOMMENDATIONS ============
      // Check if we need a new page for recommendations
      if (currentY > pageHeight - 220) {
        doc.addPage();
        currentY = 50;
      }

      doc.fontSize(18).font('Helvetica-Bold').fillColor('#111827')
        .text('Recommendations & Action Items', leftMargin, currentY);
      
      currentY += 30;

      const recommendations = [];
      
      if (resolutionRate < 70) {
        recommendations.push({ 
          priority: 'HIGH', 
          text: 'Improve resolution rate by allocating more resources to pending grievances', 
          color: '#ef4444' 
        });
      }
      
      if (avgTime > 7) {
        recommendations.push({ 
          priority: 'HIGH', 
          text: 'Reduce resolution time through process improvements and prioritization', 
          color: '#ef4444' 
        });
      }
      
      if (summary.blocked > 0) {
        recommendations.push({ 
          priority: 'MEDIUM', 
          text: `Address ${summary.blocked} blocked grievances to improve overall efficiency`, 
          color: '#f59e0b' 
        });
      }

      if (topCategory && topCategory[1] > summary.totalGrievances * 0.3) {
        recommendations.push({ 
          priority: 'MEDIUM', 
          text: `High concentration in "${topCategory[0]}" category (${topCategory[1]} cases) - consider specialized training`, 
          color: '#f59e0b' 
        });
      }

      if (topArea && topArea[1] > summary.totalGrievances * 0.2) {
        recommendations.push({ 
          priority: 'MEDIUM', 
          text: `"${topArea[0]}" area shows high grievance volume (${topArea[1]} cases) - additional resources needed`, 
          color: '#f59e0b' 
        });
      }

      if (recommendations.length === 0) {
        doc.fontSize(11).fillColor('#10b981').font('Helvetica')
          .text('Overall performance is excellent! Continue current practices and monitor trends.', 
            leftMargin, currentY, { width: pageWidth });
      } else {
        recommendations.forEach((rec, index) => {
          const rowY = currentY;
          
          // Priority badge
          doc.rect(leftMargin, rowY, 70, 22).fillAndStroke(rec.color, rec.color);
          doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff')
            .text(rec.priority, leftMargin + 5, rowY + 6);
          
          // Recommendation text
          doc.fontSize(11).font('Helvetica').fillColor('#374151')
            .text(`${index + 1}. ${rec.text}`, leftMargin + 85, rowY + 4, { width: pageWidth - 85 });
          
          currentY += 32;
        });
      }

      // ============ FOOTER ON ALL PAGES ============
      const range = doc.bufferedPageRange();
      const pageCount = range.count;
      
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(range.start + i);
        
        // Footer separator line
        doc.moveTo(leftMargin, doc.page.height - 60)
          .lineTo(doc.page.width - rightMargin, doc.page.height - 60)
          .strokeColor('#e5e7eb')
          .lineWidth(1)
          .stroke();
        
        // Footer text left
        doc.fontSize(8).font('Helvetica').fillColor('#9ca3af')
          .text(
            'GRAMS - Grievance Redressal And Management System',
            leftMargin,
            doc.page.height - 45,
            { width: pageWidth / 2, align: 'left' }
          );
        
        // Footer text right (page number)
        doc.fontSize(8).fillColor('#9ca3af')
          .text(
            `Page ${i + 1} of ${pageCount}`,
            doc.page.width / 2,
            doc.page.height - 45,
            { width: pageWidth / 2, align: 'right' }
          );
      }

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', (err) => reject(err));
      
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generatePDF };

