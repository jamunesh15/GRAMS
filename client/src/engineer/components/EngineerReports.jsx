import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [period, setPeriod] = useState('all');
  const [loading, setLoading] = useState(true); // Initial loading
  const [refreshing, setRefreshing] = useState(false); // For period change refresh
  const [reportData, setReportData] = useState(null);
  const token = localStorage.getItem('token');
  
  // Get engineer info from localStorage
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  const engineerName = userInfo.name || 'Engineer';
  const engineerEmail = userInfo.email || 'N/A';

  const periods = [
    { value: 'all', label: 'All Time', icon: '🌟' },
    { value: 'monthly', label: 'Monthly', icon: '📅' },
    { value: 'quarterly', label: 'Quarterly', icon: '📊' },
    { value: 'yearly', label: 'Yearly', icon: '📈' },
  ];

  // Fetch data when period changes
  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    try {
      // Only show full loading on initial load, not on period change
      if (!reportData) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      // Fetch ALL grievances by making multiple requests for different statuses
      const statuses = ['assigned', 'in-progress', 'resolved', 'closed'];
      const fetchedGrievances = [];
      
      for (const status of statuses) {
        try {
          const response = await axios.get(
            `${engineerEndpoints.GET_MY_ASSIGNED_GRIEVANCES_API}?status=${status}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          
          if (response.data.success && response.data.data) {
            fetchedGrievances.push(...response.data.data);
          }
        } catch (err) {
          console.log(`No ${status} grievances found`);
        }
      }

      // Remove duplicates based on _id
      const uniqueGrievances = Array.from(
        new Map(fetchedGrievances.map(item => [item._id, item])).values()
      );

      console.log('Fetched grievances:', uniqueGrievances);
      const analytics = processAnalytics(uniqueGrievances, period);
      setReportData(analytics);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to fetch report data');
      setReportData({
        total: 0,
        resolved: 0,
        inProgress: 0,
        assigned: 0,
        accuracy: 0,
        avgResolutionTime: 0,
        categoryData: [],
        priorityData: [],
        grievances: [],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const processAnalytics = (grievances, period) => {
    const now = new Date();   
    let filteredGrievances = grievances;

    // Filter by period - use resolvedAt for resolved tasks, createdAt for others
    if (period === 'all') {
      // No filtering - show all data
      filteredGrievances = grievances;
    } else if (period === 'monthly') {
      filteredGrievances = grievances.filter((g) => {
        // For resolved tasks, check if resolved this month
        // For others, check if created this month
        const relevantDate = (g.status === 'resolved' || g.status === 'closed') && g.resolvedAt 
          ? new Date(g.resolvedAt) 
          : new Date(g.createdAt);
        return (
          relevantDate.getMonth() === now.getMonth() &&
          relevantDate.getFullYear() === now.getFullYear()
        );
      });
    } else if (period === 'quarterly') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      filteredGrievances = grievances.filter((g) => {
        const relevantDate = (g.status === 'resolved' || g.status === 'closed') && g.resolvedAt 
          ? new Date(g.resolvedAt) 
          : new Date(g.createdAt);
        const quarter = Math.floor(relevantDate.getMonth() / 3);
        return quarter === currentQuarter && relevantDate.getFullYear() === now.getFullYear();
      });
    } else if (period === 'yearly') {
      filteredGrievances = grievances.filter((g) => {
        const relevantDate = (g.status === 'resolved' || g.status === 'closed') && g.resolvedAt 
          ? new Date(g.resolvedAt) 
          : new Date(g.createdAt);
        return relevantDate.getFullYear() === now.getFullYear();
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-12 shadow-2xl border-2 border-blue-200 text-center relative overflow-hidden"
      >
        {/* Animated background circles */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full filter blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            delay: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-0 right-0 w-72 h-72 bg-purple-400 rounded-full filter blur-3xl opacity-30"
        />
        
        <div className="relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-7xl mb-6 inline-block"
          >
            📊
          </motion.div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-gray-800 font-bold text-xl"
          >
            Loading Performance Reports...
          </motion.p>
          <motion.div
            className="mt-6 flex justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [-10, 10, -10],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Always visible, no re-render on period change */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 shadow-2xl border border-blue-400 relative overflow-hidden"
      >
        {/* Animated background pattern */}
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white flex items-center gap-3"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10" />
              </motion.div>
              <span className="drop-shadow-lg">Engineer Performance Reports</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-blue-100 font-medium mt-2 text-sm sm:text-base"
            >
              Analyze your performance and track your progress
            </motion.p>
          </div>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadPDF}
            className="w-full sm:w-auto px-6 py-4 bg-white text-indigo-600 rounded-xl shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-3 font-bold text-sm sm:text-base group"
          >
            <Download className="w-5 h-5 group-hover:animate-bounce" />
            <span>Download PDF Report</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Period Selector - Compact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-md border border-gray-200 p-5 relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            <span className="text-base font-semibold text-gray-700">Period:</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {periods.map((p) => (
              <motion.button
                key={p.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPeriod(p.value)}    
                disabled={refreshing}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all text-base flex items-center gap-2 ${
                  period === p.value
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${refreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span className="text-lg">{p.icon}</span>
                <span>{p.label}</span>
              </motion.button>
            ))}
          </div>
          
          {/* Refreshing indicator */}
          {refreshing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-purple-600"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full"
              />
              <span className="text-sm font-medium">Updating...</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Content that updates when period changes - wrapped for smooth transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={period}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Stats Cards with Premium Effects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <motion.div
              whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" }}
              className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10"
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Total Grievances</p>
                    <p className="text-5xl font-extrabold">
                      {reportData?.total || 0}
                    </p>
                  </div>
                  <Target className="w-12 h-12 text-blue-200" />
                </div>
                <div className="h-1 bg-blue-400 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-white"
                  />
                </div>
              </div>
            </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.4)" }}
          className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              delay: 0.5,
              repeat: Infinity,
            }}
            className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10"
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Resolved</p>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  className="text-5xl font-extrabold"
                >
                  {reportData?.resolved || 0}
                </motion.p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle className="w-12 h-12 text-green-200" />
              </motion.div>
            </div>
            <div className="h-1 bg-green-400 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: reportData?.total > 0 ? `${(reportData.resolved / reportData.total) * 100}%` : "0%" }}
                transition={{ delay: 0.9, duration: 1 }}
                className="h-full bg-white"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(245, 158, 11, 0.4)" }}
          className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              delay: 1,
              repeat: Infinity,
            }}
            className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10"
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">In Progress</p>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="text-5xl font-extrabold"
                >
                  {reportData?.inProgress || 0}
                </motion.p>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="w-12 h-12 text-orange-200" />
              </motion.div>
            </div>
            <div className="h-1 bg-orange-400 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: reportData?.total > 0 ? `${(reportData.inProgress / reportData.total) * 100}%` : "0%" }}
                transition={{ delay: 1, duration: 1 }}
                className="h-full bg-white"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)" }}
          className="bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              delay: 1.5,
              repeat: Infinity,
            }}
            className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10"
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Success Rate</p>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: "spring" }}
                  className="text-5xl font-extrabold"
                >
                  {reportData?.accuracy || 0}%
                </motion.p>
              </div>
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="w-12 h-12 text-purple-200" />
              </motion.div>
            </div>
            <div className="h-1 bg-purple-400 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${reportData?.accuracy || 0}%` }}
                transition={{ delay: 1.1, duration: 1 }}
                className="h-full bg-white"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section - Premium Design with 3D Effects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Bar Chart - Workload by Category */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, type: "spring" }}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-2xl p-6 border-2 border-blue-100 relative overflow-hidden group"
        >
          {/* Animated gradient overlay */}
          <motion.div
            animate={{
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
            className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity"
          />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg"
              >
                <BarChart3 className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Workload by Category
              </h3>
            </div>
            
            {reportData?.categoryData && reportData.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={reportData.categoryData}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={1}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={1}/>
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="colorAvgDays" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }} 
                    angle={-45}
                    textAnchor="end"
                    height={90}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }} 
                    stroke="#9ca3af"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                      border: '2px solid #e5e7eb', 
                      borderRadius: '16px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                      padding: '12px',
                    }}
                    formatter={(value, name) => {
                      if (name === 'Avg Resolution Days') return [value + ' days', name];
                      return [value, name];
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }}
                    iconType="circle"
                  />
                  <Bar 
                    dataKey="completed" 
                    fill="url(#colorCompleted)" 
                    name="Completed" 
                    radius={[10, 10, 0, 0]}
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                  <Bar 
                    dataKey="pending" 
                    fill="url(#colorPending)" 
                    name="Pending" 
                    radius={[10, 10, 0, 0]}
                    stroke="#f59e0b"
                    strokeWidth={2}
                  />
                  <Bar 
                    dataKey="avgResolutionDays" 
                    fill="url(#colorAvgDays)" 
                    name="Avg Resolution Days" 
                    radius={[10, 10, 0, 0]}
                    stroke="#8b5cf6"
                    strokeWidth={2}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    📊
                  </motion.div>
                  <p className="text-gray-500 font-semibold">No category data available</p>
                  <p className="text-gray-400 text-sm mt-2">Complete some tasks to see the distribution</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Pie Chart - Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, type: "spring" }}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-white via-orange-50 to-red-50 rounded-2xl shadow-2xl p-6 border-2 border-orange-100 relative overflow-hidden group"
        >
          {/* Animated gradient overlay */}
          <motion.div
            animate={{
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 4,
              delay: 1,
              repeat: Infinity,
            }}
            className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 opacity-0 group-hover:opacity-10 transition-opacity"
          />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg"
              >
                <PieChart className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Priority Distribution
              </h3>
            </div>
            
            {reportData?.priorityData && reportData.priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <RechartsPie>
                  <defs>
                    <filter id="shadow1">
                      <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.4"/>
                    </filter>
                  </defs>
                  <Pie
                    data={reportData.priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={140}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent, value }) => {
                      if (window.innerWidth < 640) {
                        return `${name}: ${value}`;
                      }
                      return `${name}: ${value} (${(percent * 100).toFixed(0)}%)`;
                    }}
                    labelLine={{ stroke: '#64748b', strokeWidth: 2 }}
                    style={{ filter: 'url(#shadow1)' }}
                  >
                    {reportData.priorityData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="#fff"
                        strokeWidth={4}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                      border: '2px solid #e5e7eb', 
                      borderRadius: '16px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                      padding: '12px',
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    height={50}
                    iconType="circle"
                    wrapperStyle={{ fontWeight: 600 }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="text-6xl mb-4"
                  >
                    🎯
                  </motion.div>
                  <p className="text-gray-500 font-semibold">No priority data available</p>
                  <p className="text-gray-400 text-sm mt-2">Start working on tasks to see priority breakdown</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Key Insights with Premium Animations */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, type: "spring" }}
        className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-indigo-200 relative overflow-hidden"
      >
        {/* Animated background elements */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
          }}
          className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full opacity-20 blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
          }}
          className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-20 blur-3xl"
        />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg"
            >
              <Target className="w-7 h-7 text-white" />
            </motion.div>
            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Key Insights & Performance Metrics
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: "spring" }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 15px 30px rgba(99, 102, 241, 0.3)",
              }}
              className="bg-white rounded-2xl p-6 shadow-xl relative overflow-hidden group"
            >
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-400"
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-600">Average Resolution Time</p>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  >
                    <Clock className="w-5 h-5 text-indigo-500" />
                  </motion.div>
                </div>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.4, type: "spring", bounce: 0.5 }}
                  className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                >
                  {reportData?.avgResolutionTime || 0}
                </motion.p>
                <p className="text-sm text-gray-500 mt-1 font-medium">days</p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.6, duration: 1 }}
                  className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-4"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3, type: "spring" }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 15px 30px rgba(34, 197, 94, 0.3)",
              }}
              className="bg-white rounded-2xl p-6 shadow-xl relative overflow-hidden group"
            >
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 3,
                  delay: 0.5,
                  repeat: Infinity,
                }}
                className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400"
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-600">Completion Rate</p>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </motion.div>
                </div>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5, type: "spring", bounce: 0.5 }}
                  className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                >
                  {reportData?.accuracy || 0}%
                </motion.p>
                <p className="text-sm mt-1 font-medium">
                  {Number(reportData?.accuracy || 0) > 80 ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <motion.span
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 1 }}
                      >
                        ✓
                      </motion.span>
                      Excellent Performance
                    </span>
                  ) : (
                    <span className="text-orange-600 flex items-center gap-1">
                      ⚠ Room for Improvement
                    </span>
                  )}
                </p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${reportData?.accuracy || 0}%` }}
                  transition={{ delay: 1.7, duration: 1 }}
                  className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-4"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4, type: "spring" }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 15px 30px rgba(249, 115, 22, 0.3)",
              }}
              className="bg-white rounded-2xl p-6 shadow-xl relative overflow-hidden group"
            >
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 3,
                  delay: 1,
                  repeat: Infinity,
                }}
                className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-400"
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-600">Active Workload</p>
                  <motion.div
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                  </motion.div>
                </div>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.6, type: "spring", bounce: 0.5 }}
                  className="text-4xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent"
                >
                  {(reportData?.inProgress || 0) + (reportData?.assigned || 0)}
                </motion.p>
                <p className="text-sm text-gray-500 mt-1 font-medium">pending tasks</p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: reportData?.total > 0 
                      ? `${((reportData.inProgress + reportData.assigned) / reportData.total) * 100}%` 
                      : "0%" 
                  }}
                  transition={{ delay: 1.8, duration: 1 }}
                  className="h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mt-4"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
