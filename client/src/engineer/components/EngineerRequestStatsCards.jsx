import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function EngineerRequestStatsCards({ stats, isLoading }) {
  const displayValue = (value) => (isLoading ? '...' : value);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Total Requests - Blue gradient */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }}
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
              <p className="text-blue-100 text-sm font-medium mb-1">Total Requests</p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="text-5xl font-extrabold"
              >
                {displayValue(stats.total)}
              </motion.p>
            </div>
            <BarChart3 className="w-12 h-12 text-blue-200" />
          </div>
          <div className="h-1 bg-blue-400 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.5 }}
              className="h-full bg-white"
            />
          </div>
        </div>
      </motion.div>

      {/* Pending - Orange gradient */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(245, 158, 11, 0.4)' }}
        className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group"
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
              <p className="text-orange-100 text-sm font-medium mb-1">Pending</p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="text-5xl font-extrabold"
              >
                {displayValue(stats.pending)}
              </motion.p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Clock className="w-12 h-12 text-orange-200" />
            </motion.div>
          </div>
          <div className="h-1 bg-orange-400 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: stats.total > 0 ? `${(stats.pending / stats.total) * 100}%` : '0%',
              }}
              transition={{ delay: 0.6, duration: 1 }}
              className="h-full bg-white"
            />
          </div>
        </div>
      </motion.div>

      {/* Approved - Green gradient */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)' }}
        className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group"
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
              <p className="text-green-100 text-sm font-medium mb-1">Approved</p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="text-5xl font-extrabold"
              >
                {displayValue(stats.approved)}
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
              animate={{
                width: stats.total > 0 ? `${(stats.approved / stats.total) * 100}%` : '0%',
              }}
              transition={{ delay: 0.7, duration: 1 }}
              className="h-full bg-white"
            />
          </div>
        </div>
      </motion.div>

      {/* Rejected - Red/Rose gradient */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(239, 68, 68, 0.4)' }}
        className="bg-gradient-to-br from-red-500 via-rose-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group"
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
              <p className="text-red-100 text-sm font-medium mb-1">Rejected</p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="text-5xl font-extrabold"
              >
                {displayValue(stats.rejected)}
              </motion.p>
            </div>
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <XCircle className="w-12 h-12 text-red-200" />
            </motion.div>
          </div>
          <div className="h-1 bg-red-400 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: stats.total > 0 ? `${(stats.rejected / stats.total) * 100}%` : '0%',
              }}
              transition={{ delay: 0.8, duration: 1 }}
              className="h-full bg-white"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
