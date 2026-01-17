import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, TrendingUp, CheckCircle, Clock, Target, BarChart3, PieChart } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { engineerEndpoints } from '../../Services/apis';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function EngineerReports() {
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const token = localStorage.getItem('token');
  
  // Get engineer info from localStorage
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  const engineerName = userInfo.name || 'Engineer';
  const engineerEmail = userInfo.email || 'N/A';

  const periods = [
    { value: 'monthly', label: 'Monthly', icon: '📅' },
    { value: 'quarterly', label: 'Quarterly', icon: '📊' },
    { value: 'yearly', label: 'Yearly', icon: '📈' },
  ];

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Fetch ALL grievances (resolved, closed, and others)
      // We'll use status=all to get everything
      const response = await axios.get(
        `${engineerEndpoints.GET_MY_ASSIGNED_GRIEVANCES_API}?status=all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const grievances = response.data.data;
        const analytics = processAnalytics(grievances, period);
        setReportData(analytics);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (grievances, period) => {
    const now = new Date();   
    let filteredGrievances = grievances;

    // Filter by period
    if (period === 'monthly') {
      filteredGrievances = grievances.filter((g) => {
        const date = new Date(g.createdAt);
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      });
    } else if (period === 'quarterly') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      filteredGrievances = grievances.filter((g) => {
        const date = new Date(g.createdAt);
        const quarter = Math.floor(date.getMonth() / 3);
        return quarter === currentQuarter && date.getFullYear() === now.getFullYear();
      });
    } else if (period === 'yearly') {
      filteredGrievances = grievances.filter((g) => {
        const date = new Date(g.createdAt);
        return date.getFullYear() === now.getFullYear();
      });
    }

    const total = filteredGrievances.length;
    const resolved = filteredGrievances.filter((g) => g.status === 'resolved' || g.status === 'closed').length;
    const inProgress = filteredGrievances.filter((g) => g.status === 'in-progress').length;
    const assigned = filteredGrievances.filter((g) => g.status === 'assigned').length;

    // Calculate average resolution time
    const resolvedWithTime = filteredGrievances.filter(
      (g) => (g.status === 'resolved' || g.status === 'closed') && g.resolvedAt
    );
    const avgResolutionTime =
      resolvedWithTime.length > 0
        ? resolvedWithTime.reduce((sum, g) => {
            const start = new Date(g.assignedAt || g.createdAt);
            const end = new Date(g.resolvedAt);
            return sum + (end - start) / (1000 * 60 * 60 * 24); // days
          }, 0) / resolvedWithTime.length
        : 0;

    // Accuracy percentage (resolved / total)
    const accuracy = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;

    // Category distribution with meaningful metrics (for bar chart)
    const categoryData = ['water', 'waste', 'roads', 'electric', 'administrative', 'healthcare', 'education', 'sanitation', 'other']
      .map((cat) => {
        const categoryGrievances = filteredGrievances.filter((g) => g.category === cat);
        const count = categoryGrievances.length;
        
        // Calculate average resolution time for this category
        const resolvedInCategory = categoryGrievances.filter(g => (g.status === 'resolved' || g.status === 'closed') && g.resolvedAt);
        const avgResTime = resolvedInCategory.length > 0
          ? resolvedInCategory.reduce((sum, g) => {
              const start = new Date(g.assignedAt || g.createdAt);
              const end = new Date(g.resolvedAt);
              return sum + (end - start) / (1000 * 60 * 60 * 24);
            }, 0) / resolvedInCategory.length
          : 0;
        
        // Count by status
        const completed = categoryGrievances.filter(g => g.status === 'resolved' || g.status === 'closed').length;
        const pending = categoryGrievances.filter(g => g.status === 'in-progress' || g.status === 'assigned').length;
        
        return {
          category: cat.charAt(0).toUpperCase() + cat.slice(1),
          total: count,
          completed: completed,
          pending: pending,
          avgResolutionDays: Math.round(avgResTime * 10) / 10,
        };
      })
      .filter((item) => item.total > 0); // Only show categories with data

    // Priority distribution with resolution time (for pie chart)
    const priorityData = ['low', 'medium', 'high', 'critical']
      .map((priority) => {
        const priorityGrievances = filteredGrievances.filter((g) => g.priority === priority);
        const count = priorityGrievances.length;
        
        const colors = {
          low: '#10b981',
          medium: '#3b82f6',
          high: '#f59e0b',
          critical: '#ef4444',
        };
        
        return {
          name: priority.charAt(0).toUpperCase() + priority.slice(1),
          value: count,
          color: colors[priority],
        };
      })
      .filter((item) => item.value > 0); // Only show priorities with data

    return {
      total,
      resolved,
      inProgress,
      assigned,
      accuracy,
      avgResolutionTime: avgResolutionTime.toFixed(1),
      categoryData,
      priorityData,
      grievances: filteredGrievances,
    };
  };

  const downloadPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header with gradient-like effect
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Logo and title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('GRAMS ENGINEER REPORT', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${period.charAt(0).toUpperCase() + period.slice(1)} Performance Report`,
      pageWidth / 2,
      30,
      { align: 'center' }
    );

    // Date and user info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 50);
    doc.text(`Period: ${period.toUpperCase()}`, 15, 57);
    doc.text(`Engineer: ${engineerName}`, 15, 64);
    doc.text(`Email: ${engineerEmail}`, 15, 71);

    // Summary Statistics Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Performance Summary', 15, 85);

    // Stats boxes
    const stats = [
      { label: 'Total Grievances', value: reportData.total, color: [59, 130, 246] },
      { label: 'Resolved', value: reportData.resolved, color: [16, 185, 129] },
      { label: 'In Progress', value: reportData.inProgress, color: [245, 158, 11] },
      { label: 'Accuracy Rate', value: `${reportData.accuracy}%`, color: [139, 92, 246] },
    ];

    let yPos = 95;
    stats.forEach((stat, index) => {
      const xPos = 15 + (index % 2) * 90;
      if (index % 2 === 0 && index > 0) yPos += 25;

      doc.setFillColor(...stat.color);
      doc.roundedRect(xPos, yPos, 85, 20, 3, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(stat.label, xPos + 5, yPos + 8);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(String(stat.value), xPos + 5, yPos + 17);
    });

    // Key Metrics
    yPos += 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Key Metrics', 15, yPos);

    yPos += 10;
    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value', 'Status']],
      body: [
        [
          'Average Resolution Time',
          `${reportData.avgResolutionTime} days`,
          reportData.avgResolutionTime < 7 ? '✓ Excellent' : '⚠ Needs Improvement',
        ],
        [
          'Completion Rate',
          `${reportData.accuracy}%`,
          reportData.accuracy > 80 ? '✓ Excellent' : '⚠ Needs Improvement',
        ],
        ['Total Assigned', reportData.total, reportData.total > 0 ? '✓ Active' : '- No Data'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 15, right: 15 },
    });

    // Category Distribution
    yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Grievance Distribution by Category', 15, yPos);

    yPos += 10;
    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Total', 'Completed', 'Pending', 'Avg Resolution (days)']],
      body: reportData.categoryData.map((c) => [
        c.category,
        c.total,
        c.completed,
        c.pending,
        c.avgResolutionDays,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 15, right: 15 },
    });

    // Grievance Details
    if (reportData.grievances.length > 0) {
      yPos = doc.lastAutoTable.finalY + 15;

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text('Grievance Details', 15, yPos);

      yPos += 10;
      autoTable(doc, {
        startY: yPos,
        head: [['Tracking ID', 'Title', 'Priority', 'Status']],
        body: reportData.grievances.slice(0, 10).map((g) => [
          g.trackingId,
          g.title.substring(0, 30) + (g.title.length > 30 ? '...' : ''),
          g.priority.toUpperCase(),
          g.status.replace('-', ' ').toUpperCase(),
        ]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 15, right: 15 },
      });
    }

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${totalPages} | GRAMS - Grievance Redressal and Management System`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save
    doc.save(`GRAMS_Engineer_Report_${period}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Report downloaded successfully! 📄');
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-12 shadow-lg border border-blue-100 text-center">
        <div className="animate-spin text-6xl mb-4">📊</div> 
        <p className="text-gray-700 font-semibold">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-3 sm:p-6 shadow-lg border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <span className="break-words">Engineer Performance Reports</span>
          </h1>
          <p className="text-gray-700 font-medium mt-2 text-xs sm:text-sm lg:text-base">Analyze your performance and track your progress</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadPDF}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 font-semibold text-sm sm:text-base"
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Download PDF Report</span>
          <span className="sm:hidden">Download PDF</span>
        </motion.button>
      </div>

      {/* Period Selector */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-xl shadow-lg border border-purple-100 p-3 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Select Report Period</h3>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {periods.map((p) => (
            <motion.button
              key={p.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPeriod(p.value)}    
              className={`px-2 sm:px-6 py-2 sm:py-4 rounded-xl font-semibold transition-all text-xs sm:text-base ${
                period === p.value
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl sm:text-2xl mb-1 sm:mb-2 block">{p.icon}</span>
              {p.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Grievances</p>
              <p className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">{reportData?.total || 0}</p>
            </div>
            <Target className="w-8 h-8 sm:w-12 sm:h-12 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 sm:p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs sm:text-sm font-medium">Resolved</p>
              <p className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">{reportData?.resolved || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 sm:p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs sm:text-sm font-medium">In Progress</p>
              <p className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">{reportData?.inProgress || 0}</p>
            </div>
            <Clock className="w-8 h-8 sm:w-12 sm:h-12 text-orange-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs sm:text-sm font-medium">Accuracy Rate</p>
              <p className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">{reportData?.accuracy || 0}%</p>
            </div>
            <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12 text-purple-200" />
          </div>
        </motion.div>
      </div>

      {/* Charts Section - Enhanced with Gradients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
        {/* Bar Chart - Grievances by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl shadow-lg p-3 sm:p-6 border border-blue-100"
        >
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Workload by Category
          </h3>
          <ResponsiveContainer width="100%" height={300} className="sm:h-[350px]">
            <BarChart data={reportData?.categoryData || []}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.7}/>
                </linearGradient>
                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0.7}/>
                </linearGradient>
                <linearGradient id="colorAvgDays" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="category" 
                tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 500 }} 
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="#9ca3af"
              />
              <YAxis 
                tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 500 }} 
                stroke="#9ca3af"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                formatter={(value, name) => {
                  if (name === 'Avg Resolution Days') return [value + ' days', name];
                  return [value, name];
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                iconType="circle"
              />
              <Bar 
                dataKey="completed" 
                fill="url(#colorCompleted)" 
                name="Completed" 
                radius={[8, 8, 0, 0]}
                stroke="#10b981"
                strokeWidth={1}
              />
              <Bar 
                dataKey="pending" 
                fill="url(#colorPending)" 
                name="Pending" 
                radius={[8, 8, 0, 0]}
                stroke="#f59e0b"
                strokeWidth={1}
              />
              <Bar 
                dataKey="avgResolutionDays" 
                fill="url(#colorAvgDays)" 
                name="Avg Resolution Days" 
                radius={[8, 8, 0, 0]}
                stroke="#8b5cf6"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart - Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-orange-50 via-white to-red-50 rounded-xl shadow-lg p-3 sm:p-6 border border-orange-100"
        >
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            Priority Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300} className="sm:h-[350px]">
            <RechartsPie>
              <defs>
                <filter id="shadow1">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3"/>
                </filter>
              </defs>
              <Pie
                data={reportData?.priorityData || []}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={130}
                fill="#8884d8"
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent, value }) => {
                  // Only show label on larger screens
                  if (window.innerWidth < 640) {
                    return `${name}: ${value}`;
                  }
                  return `${name}: ${value} (${(percent * 100).toFixed(0)}%)`;
                }}
                labelLine={{ stroke: '#64748b', strokeWidth: 2 }}
                style={{ filter: 'url(#shadow1)' }}
              >
                {reportData?.priorityData?.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="#fff"
                    strokeWidth={3}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
                iconType="circle"
              />
            </RechartsPie>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Additional Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-md p-4 sm:p-8"
      >
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
          Key Insights & Performance Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Average Resolution Time</p>
            <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{reportData?.avgResolutionTime || 0}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">days</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Completion Rate</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{reportData?.accuracy || 0}%</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {reportData?.accuracy > 80 ? '✓ Excellent Performance' : '⚠ Room for Improvement'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Active Workload</p>
            <p className="text-2xl sm:text-2xl sm:text-3xl font-bold text-orange-600">
              {(reportData?.inProgress || 0) + (reportData?.assigned || 0)}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">pending tasks</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
