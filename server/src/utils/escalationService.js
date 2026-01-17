const Grievance = require('../models/Grievance');

/**
 * Auto-escalate grievances that have been open for more than 7 days
 * Creates pressure on authorities by marking them as "blocked"
 */
const autoEscalateGrievances = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find grievances open for > 7 days that haven't been escalated yet
    const grievancesToEscalate = await Grievance.find({
      status: { $in: ['open', 'in-progress'] },
      isEscalated: false,
      createdAt: { $lte: sevenDaysAgo },
    });

    if (grievancesToEscalate.length > 0) {
      // Update all to blocked status and mark as escalated
      const updatePromises = grievancesToEscalate.map(grievance => {
        grievance.status = 'blocked';
        grievance.isEscalated = true;
        grievance.escalatedAt = new Date();
        
        // Calculate days open
        const daysOpen = Math.floor((Date.now() - grievance.createdAt) / (1000 * 60 * 60 * 24));
        grievance.daysOpen = daysOpen;

        // Add system comment
        grievance.comments.push({
          userId: null, // System comment
          comment: `⚠️ ESCALATED: This grievance has been open for ${daysOpen} days without resolution. Status changed to BLOCKED to create accountability pressure on authorities.`,
          createdAt: new Date(),
        });

        return grievance.save();
      });

      await Promise.all(updatePromises);

      console.log(`✅ Auto-escalated ${grievancesToEscalate.length} grievances to BLOCKED status`);
      return grievancesToEscalate.length;
    }

    console.log('✓ No grievances need escalation at this time');
    return 0;
  } catch (error) {
    console.error('❌ Error in auto-escalation service:', error);
    throw error;
  }
};

/**
 * Update days open for all active grievances
 */
const updateDaysOpen = async () => {
  try {
    const activeGrievances = await Grievance.find({
      status: { $in: ['open', 'in-progress', 'blocked'] },
    });

    const updatePromises = activeGrievances.map(grievance => {
      const daysOpen = Math.floor((Date.now() - grievance.createdAt) / (1000 * 60 * 60 * 24));
      grievance.daysOpen = daysOpen;
      return grievance.save();
    });

    await Promise.all(updatePromises);
    console.log(`✅ Updated daysOpen for ${activeGrievances.length} grievances`);
  } catch (error) {
    console.error('❌ Error updating daysOpen:', error);
  }
};

/**
 * Calculate escalation risk score
 */
const calculateEscalationRisk = (grievance) => {
  const daysOpen = Math.floor((Date.now() - grievance.createdAt) / (1000 * 60 * 60 * 24));
  
  if (daysOpen >= 7) return 'critical';
  if (daysOpen >= 5) return 'high';
  if (daysOpen >= 3) return 'medium';
  return 'low';
};

module.exports = {
  autoEscalateGrievances,
  updateDaysOpen,
  calculateEscalationRisk,
};
