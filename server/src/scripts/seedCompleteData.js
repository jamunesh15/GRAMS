const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Grievance = require('../models/Grievance');
const User = require('../models/User');
require('dotenv').config();

const categories = ['water', 'waste', 'roads', 'electric', 'sanitation'];
const priorities = ['low', 'medium', 'high', 'critical'];
const statuses = ['open', 'in-progress', 'resolved', 'closed'];
const wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5'];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const seedCompleteData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grams');
    console.log('✅ Connected to MongoDB');

    // Create Engineers
    console.log('\n📝 Creating engineers...');
    const engineerData = [
      { name: 'Rajesh Kumar', email: 'rajesh.engineer@grams.com' },
      { name: 'Priya Sharma', email: 'priya.engineer@grams.com' },
      { name: 'Amit Patel', email: 'amit.engineer@grams.com' },
      { name: 'Sneha Reddy', email: 'sneha.engineer@grams.com' },
    ];

    const engineers = [];
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (const data of engineerData) {
      const existing = await User.findOne({ email: data.email });
      if (!existing) {
        const engineer = await User.create({
          ...data,
          password: hashedPassword,
          role: 'engineer',
          phone: `98765${Math.floor(Math.random() * 100000)}`,
          isVerified: true,
        });
        engineers.push(engineer);
        console.log(`  ✓ Created engineer: ${data.name}`);
      } else {
        engineers.push(existing);
        console.log(`  ⚠ Engineer already exists: ${data.name}`);
      }
    }

    // Create Citizens
    console.log('\n📝 Creating citizens...');
    const citizenData = [
      { name: 'Sunita Mehta', email: 'sunita.citizen@grams.com' },
      { name: 'Vikram Singh', email: 'vikram.citizen@grams.com' },
      { name: 'Anjali Nair', email: 'anjali.citizen@grams.com' },
      { name: 'Rahul Verma', email: 'rahul.citizen@grams.com' },
      { name: 'Kavita Desai', email: 'kavita.citizen@grams.com' },
    ];

    const citizens = [];
    for (const data of citizenData) {
      const existing = await User.findOne({ email: data.email });
      if (!existing) {
        const citizen = await User.create({
          ...data,
          password: hashedPassword,
          role: 'citizen',
          phone: `98765${Math.floor(Math.random() * 100000)}`,
          isVerified: true,
        });
        citizens.push(citizen);
        console.log(`  ✓ Created citizen: ${data.name}`);
      } else {
        citizens.push(existing);
        console.log(`  ⚠ Citizen already exists: ${data.name}`);
      }
    }

    // Create Sample Grievances
    console.log('\n📝 Creating sample grievances...');
    const grievances = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < 60; i++) {
      const createdAt = getRandomDate(sixtyDaysAgo, now);
      const category = getRandomElement(categories);
      const priority = getRandomElement(priorities);
      const status = getRandomElement(statuses);
      const ward = getRandomElement(wards);
      const citizen = getRandomElement(citizens);
      const engineer = getRandomElement(engineers);

      // Calculate resolution date for resolved grievances
      let resolutionDate = null;
      if (status === 'resolved') {
        const daysToResolve = Math.floor(Math.random() * 20) + 1; // 1-20 days
        resolutionDate = new Date(createdAt.getTime() + daysToResolve * 24 * 60 * 60 * 1000);
        // Make sure resolution date is not in the future
        if (resolutionDate > now) {
          resolutionDate = now;
        }
      }

      const grievance = {
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} issue in ${ward}`,
        description: `Sample grievance for ${category} category. Priority level: ${priority}. This is a test grievance created for analytics demonstration.`,
        category,
        priority,
        status,
        ward,
        location: `${77.5 + Math.random() * 0.5},${12.9 + Math.random() * 0.5}`, // Stored as string "lat,lng"
        address: `${Math.floor(Math.random() * 1000)}, ${ward}, Bangalore - 560${Math.floor(Math.random() * 100)}`,
        userId: citizen._id,
        userEmail: citizen.email,
        assignedTo: status !== 'open' ? engineer._id : null,
        createdAt,
        updatedAt: resolutionDate || createdAt,
        resolutionDate,
        attachments: [],
      };

      grievances.push(grievance);
    }

    const result = await Grievance.insertMany(grievances);
    console.log(`\n✅ Successfully created ${result.length} sample grievances!`);

    // Show summary
    console.log('\n📊 Summary Statistics:');
    console.log(`  Engineers: ${engineers.length}`);
    console.log(`  Citizens: ${citizens.length}`);
    console.log(`  Total Grievances: ${result.length}`);

    const statusCounts = await Grievance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    console.log('\n📈 Grievances by Status:');
    statusCounts.forEach((item) => {
      console.log(`  ${item._id}: ${item.count}`);
    });

    const priorityCounts = await Grievance.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    console.log('\n🎯 Grievances by Priority:');
    priorityCounts.forEach((item) => {
      console.log(`  ${item._id}: ${item.count}`);
    });

    const resolvedCount = await Grievance.countDocuments({ status: 'resolved' });
    console.log(`\n✨ Total Resolved: ${resolvedCount} (Analytics data ready!)`);

    console.log('\n🔑 Test Login Credentials:');
    console.log('  Engineer: rajesh.engineer@grams.com / password123');
    console.log('  Citizen:  sunita.citizen@grams.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedCompleteData();
