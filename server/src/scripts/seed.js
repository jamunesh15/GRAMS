require('dotenv').config();
const connectDB = require('../config/database');
const User = require('../models/User');
const Grievance = require('../models/Grievance');

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// Sample data for realistic grievances
const grievanceTitles = {
  infrastructure: [
    'Broken street light on Main Road',
    'Pothole causing accidents near market',
    'Damaged footpath in residential area',
    'Water logging during monsoon season',
    'Collapsed drainage system',
    'Cracked wall in community center',
    'Broken public bench in park',
    'Street signage missing at intersection',
    'Damaged road divider near school',
    'Broken public toilet facility',
  ],
  health: [
    'Mosquito breeding in open drains',
    'Garbage not collected for weeks',
    'Stray dog menace in locality',
    'Contaminated water supply',
    'Lack of sanitization in public areas',
    'Medical waste dumping near homes',
    'Broken sewage line causing health hazard',
    'No ambulance service available',
    'Expired medicines in PHC',
    'Unhygienic food stalls near hospital',
  ],
  academic: [
    'School building needs repair',
    'Lack of teachers in government school',
    'No computer lab facilities',
    'Broken furniture in classrooms',
    'Library books outdated',
    'No drinking water in school',
    'Playground equipment damaged',
    'School bus service irregular',
    'Mid-day meal quality poor',
    'No proper sanitation in school toilets',
  ],
  administrative: [
    'Pension not received for 3 months',
    'Ration card application pending',
    'Birth certificate delay',
    'Property tax receipt not issued',
    'Land record discrepancy',
    'Aadhar card linking issue',
    'Caste certificate application rejected',
    'Income certificate delay',
    'Building permit stuck in process',
    'Marriage certificate not issued',
  ],
  other: [
    'Noise pollution from factory',
    'Illegal construction in neighborhood',
    'Tree cutting without permission',
    'Encroachment on public land',
    'Illegal parking blocking road',
    'Loudspeaker noise violation',
    'Cable wires hanging dangerously',
    'Unauthorized hoarding on road',
    'Public park not maintained',
    'Community hall booking issues',
  ],
};

const descriptions = {
  infrastructure: [
    'This issue has been causing problems for residents for several days. Multiple complaints have been filed but no action taken.',
    'The damaged infrastructure is posing a serious risk to pedestrians and vehicles. Immediate repair work is needed.',
    'Despite repeated requests, the concerned department has not addressed this issue. Local residents are facing daily inconvenience.',
  ],
  health: [
    'This is a serious health concern affecting many families in the area. The situation is getting worse day by day.',
    'The unhygienic conditions are leading to spread of diseases. Children and elderly are most affected.',
    'Multiple residents have fallen sick due to this issue. Urgent intervention from health department required.',
  ],
  academic: [
    'Students are suffering due to lack of basic facilities. Parents are concerned about the quality of education.',
    'The school administration has been unresponsive to our complaints. Children deserve better learning environment.',
    'This issue is affecting the academic performance of students. Immediate action is requested.',
  ],
  administrative: [
    'I have been running from pillar to post for months. The officials keep passing the file without any resolution.',
    'Despite submitting all required documents, my application is still pending. This is causing financial hardship.',
    'The delay in processing is causing significant inconvenience. Request expedited action on this matter.',
  ],
  other: [
    'This issue is affecting the quality of life in our neighborhood. Multiple residents have complained.',
    'Despite several verbal complaints, no action has been taken. We request formal intervention.',
    'The problem has persisted for weeks now. Local authorities seem unaware or unwilling to act.',
  ],
};

const userNames = [
  'Rajesh Kumar', 'Priya Sharma', 'Mohammed Ali', 'Lakshmi Devi', 'Suresh Reddy',
  'Anita Singh', 'Venkat Rao', 'Fatima Begum', 'Ramesh Patel', 'Sunita Gupta',
  'Arun Nair', 'Meena Kumari', 'Sanjay Verma', 'Kavitha Menon', 'Prakash Joshi',
  'Deepa Krishnan', 'Vijay Malhotra', 'Rekha Iyer', 'Manoj Tiwari', 'Geeta Rani',
];

const officerNames = [
  'Dr. Anil Kumar (IAS)', 'Smt. Padma Rao (Block Officer)', 'Shri. Rajan Singh (Ward Officer)',
  'Dr. Meera Patel (Health Inspector)', 'Shri. Kumar Swamy (PWD Engineer)',
  'Smt. Lakshmi Naidu (Education Officer)', 'Shri. Abdul Rehman (Sanitation Head)',
];

(async () => {
  try {
    await connectDB();

    console.log('🌱 Starting comprehensive database seeding...\n');

    // Clear existing data if SEED_CLEAN=true
    const cleanSeed = String(process.env.SEED_CLEAN || '').toLowerCase() === 'true';
    if (cleanSeed) {
      await User.deleteMany({});
      await Grievance.deleteMany({});
      console.log('🗑️  Cleared existing data\n');
    }

    // Create Admin User
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@grams.local';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = new User({
        name: 'System Administrator',
        email: adminEmail,
        password: adminPassword,
        phone: '9999999999',
        role: 'admin',
      });
      await adminUser.save();
      console.log('✅ Admin user created:', adminEmail);
    } else {
      console.log('ℹ️  Admin user exists:', adminEmail);
    }

    // Create Officers (using 'moderator' role)
    const officers = [];
    for (let i = 0; i < officerNames.length; i++) {
      const email = `officer${i + 1}@grams.com`;
      let officer = await User.findOne({ email });
      if (!officer) {
        officer = new User({
          name: officerNames[i],
          email,
          password: 'Officer@123',
          phone: `98765${String(i).padStart(5, '0')}`,
          role: 'moderator',
          department: pick(['Infrastructure', 'Health', 'Education', 'Administration', 'General']),
        });
        await officer.save();
        console.log('✅ Officer created:', officer.name);
      }
      officers.push(officer);
    }

    // Create Regular Users
    const citizens = [];
    for (let i = 0; i < userNames.length; i++) {
      const email = `citizen${i + 1}@grams.com`;
      let citizen = await User.findOne({ email });
      if (!citizen) {
        citizen = new User({
          name: userNames[i],
          email,
          password: 'Citizen@123',
          phone: `91234${String(i).padStart(5, '0')}`,
          role: 'user',
        });
        await citizen.save();
      }
      citizens.push(citizen);
    }
    console.log(`✅ ${citizens.length} citizen users ready\n`);

    // Seed Grievances
    const existingGrievances = await Grievance.countDocuments();
    if (existingGrievances > 0 && !cleanSeed) {
      console.log(`ℹ️  Skipped grievance seeding (${existingGrievances} exist). Use SEED_CLEAN=true to reseed.`);
    } else {
      const categories = ['academic', 'infrastructure', 'health', 'administrative', 'other'];
      const priorities = ['low', 'medium', 'high', 'critical'];
      const budgetCategories = ['water', 'roads', 'electricity', 'other'];

      const grievances = [];

      // Create diverse grievances
      // 1. Old overdue grievances (for transparency page)
      for (let i = 0; i < 15; i++) {
        const category = pick(categories);
        const createdAt = daysAgo(randInt(10, 30)); // 10-30 days old
        const citizen = pick(citizens);
        const officer = randInt(0, 2) ? pick(officers) : null;
        const assignedAt = officer ? new Date(createdAt.getTime() + randInt(24, 72) * 60 * 60 * 1000) : null;

        grievances.push({
          title: pick(grievanceTitles[category]),
          description: pick(descriptions[category]),
          category,
          priority: pick(['medium', 'high', 'critical']),
          status: pick(['open', 'in-progress']),
          userId: citizen._id,
          assignedTo: officer?._id,
          firstAssignedAt: assignedAt,
          assignedAt,
          upvotes: randInt(5, 150),
          reopenedCount: randInt(0, 2),
          createdAt,
          updatedAt: assignedAt || createdAt,
        });
      }

      // 2. Recently resolved grievances (good metrics)
      for (let i = 0; i < 25; i++) {
        const category = pick(categories);
        const createdAt = daysAgo(randInt(5, 20));
        const citizen = pick(citizens);
        const officer = pick(officers);
        const assignedAt = new Date(createdAt.getTime() + randInt(2, 24) * 60 * 60 * 1000);
        const resolvedAt = new Date(createdAt.getTime() + randInt(2, 6) * 24 * 60 * 60 * 1000);

        const hasBudget = ['infrastructure', 'health'].includes(category) && randInt(0, 1);
        const budget = hasBudget ? {
          category: pick(budgetCategories),
          amount: randInt(10000, 75000),
        } : undefined;

        grievances.push({
          title: pick(grievanceTitles[category]),
          description: pick(descriptions[category]),
          category,
          priority: pick(priorities),
          status: 'resolved',
          userId: citizen._id,
          assignedTo: officer._id,
          firstAssignedAt: assignedAt,
          assignedAt,
          upvotes: randInt(0, 30),
          reopenedCount: 0,
          resolution: 'Issue has been resolved. Thank you for bringing this to our attention.',
          resolutionDate: resolvedAt,
          citizenRating: randInt(3, 5),
          budget,
          createdAt,
          updatedAt: resolvedAt,
        });
      }

      // 3. Recent pending grievances (normal flow)
      for (let i = 0; i < 20; i++) {
        const category = pick(categories);
        const createdAt = daysAgo(randInt(0, 6)); // Within SLA
        const citizen = pick(citizens);
        const officer = randInt(0, 1) ? pick(officers) : null;
        const assignedAt = officer ? new Date(createdAt.getTime() + randInt(1, 12) * 60 * 60 * 1000) : null;

        grievances.push({
          title: pick(grievanceTitles[category]),
          description: pick(descriptions[category]),
          category,
          priority: pick(priorities),
          status: officer ? 'in-progress' : 'open',
          userId: citizen._id,
          assignedTo: officer?._id,
          firstAssignedAt: assignedAt,
          assignedAt,
          upvotes: randInt(0, 10),
          createdAt,
          updatedAt: assignedAt || createdAt,
        });
      }

      // 4. Closed/Rejected grievances
      for (let i = 0; i < 10; i++) {
        const category = pick(categories);
        const createdAt = daysAgo(randInt(15, 45));
        const citizen = pick(citizens);
        const officer = pick(officers);
        const status = pick(['closed', 'rejected']);

        grievances.push({
          title: pick(grievanceTitles[category]),
          description: pick(descriptions[category]),
          category,
          priority: pick(['low', 'medium']),
          status,
          userId: citizen._id,
          assignedTo: officer._id,
          resolution: status === 'rejected' ? 'Complaint does not fall under our jurisdiction.' : 'Issue closed after verification.',
          resolutionDate: daysAgo(randInt(5, 15)),
          citizenRating: status === 'closed' ? randInt(2, 4) : undefined,
          createdAt,
          updatedAt: daysAgo(randInt(5, 15)),
        });
      }

      // 5. High priority critical issues (for dashboard)
      for (let i = 0; i < 5; i++) {
        const category = pick(['infrastructure', 'health']);
        const createdAt = daysAgo(randInt(3, 8));
        const citizen = pick(citizens);
        const officer = pick(officers);
        const assignedAt = new Date(createdAt.getTime() + randInt(1, 6) * 60 * 60 * 1000);

        grievances.push({
          title: pick(grievanceTitles[category]),
          description: 'URGENT: ' + pick(descriptions[category]) + ' This requires immediate attention from authorities.',
          category,
          priority: 'critical',
          status: 'in-progress',
          userId: citizen._id,
          assignedTo: officer._id,
          firstAssignedAt: assignedAt,
          assignedAt,
          upvotes: randInt(50, 200),
          budget: {
            category: pick(budgetCategories),
            amount: randInt(50000, 150000),
          },
          createdAt,
          updatedAt: assignedAt,
        });
      }

      // 6. Reopened issues (repeat issues metric)
      for (let i = 0; i < 5; i++) {
        const category = pick(categories);
        const createdAt = daysAgo(randInt(20, 40));
        const citizen = pick(citizens);
        const officer = pick(officers);

        grievances.push({
          title: pick(grievanceTitles[category]) + ' (Reopened)',
          description: pick(descriptions[category]) + ' This issue was marked resolved earlier but has resurfaced.',
          category,
          priority: 'high',
          status: 'in-progress',
          userId: citizen._id,
          assignedTo: officer._id,
          firstAssignedAt: daysAgo(randInt(15, 35)),
          assignedAt: daysAgo(randInt(1, 5)),
          upvotes: randInt(20, 80),
          reopenedCount: randInt(1, 3),
          createdAt,
          updatedAt: daysAgo(randInt(1, 5)),
        });
      }

      await Grievance.insertMany(grievances);
      console.log(`✅ Seeded ${grievances.length} grievances\n`);

      // Summary
      const stats = {
        total: grievances.length,
        open: grievances.filter(g => g.status === 'open').length,
        inProgress: grievances.filter(g => g.status === 'in-progress').length,
        resolved: grievances.filter(g => g.status === 'resolved').length,
        closed: grievances.filter(g => g.status === 'closed').length,
        rejected: grievances.filter(g => g.status === 'rejected').length,
        withBudget: grievances.filter(g => g.budget).length,
        overdue: grievances.filter(g => {
          const age = (Date.now() - new Date(g.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          return age > 7 && ['open', 'in-progress'].includes(g.status);
        }).length,
      };

      console.log('📊 Grievance Statistics:');
      console.log(`   Total: ${stats.total}`);
      console.log(`   Open: ${stats.open}`);
      console.log(`   In Progress: ${stats.inProgress}`);
      console.log(`   Resolved: ${stats.resolved}`);
      console.log(`   Closed: ${stats.closed}`);
      console.log(`   Rejected: ${stats.rejected}`);
      console.log(`   With Budget: ${stats.withBudget}`);
      console.log(`   Overdue (>7 days): ${stats.overdue}`);
    }

    console.log('\n✨ Seeding completed successfully!\n');
    console.log('📝 Login Credentials:');
    console.log(`   Admin: ${adminEmail} / ${adminPassword}`);
    console.log('   Officers: officer1@grams.com / Officer@123');
    console.log('   Citizens: citizen1@grams.com / Citizen@123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
})();
