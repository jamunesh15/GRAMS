const mongoose = require('mongoose');
const Grievance = require('../models/Grievance');
const User = require('../models/User');
require('dotenv').config();

const categories = ['water', 'electricity', 'roads', 'sanitation', 'streetlights'];
const priorities = ['low', 'medium', 'high', 'critical'];
const statuses = ['pending', 'assigned', 'in-progress', 'resolved'];
const wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5'];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const seedAnalyticsData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grams');
    console.log('Connected to MongoDB');

    // Get all engineers and citizens
    const engineers = await User.find({ role: 'engineer' });
    const citizens = await User.find({ role: 'citizen' });

    if (engineers.length === 0 || citizens.length === 0) {
      console.log('Please create some engineer and citizen users first');
      process.exit(1);
    }

    console.log(`Found ${engineers.length} engineers and ${citizens.length} citizens`);

    // Clear existing grievances (optional - comment out if you want to keep existing data)
    // await Grievance.deleteMany({});
    // console.log('Cleared existing grievances');

    const grievances = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Create 50 sample grievances
    for (let i = 0; i < 50; i++) {
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
        const daysToResolve = Math.floor(Math.random() * 15) + 1; // 1-15 days
        resolutionDate = new Date(createdAt.getTime() + daysToResolve * 24 * 60 * 60 * 1000);
      }

      const grievance = {
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} issue in ${ward}`,
        description: `Sample grievance for ${category} - Priority: ${priority}`,
        category,
        priority,
        status,
        ward,
        location: {
          type: 'Point',
          coordinates: [
            77.5 + Math.random() * 0.5, // Longitude (near Bangalore)
            12.9 + Math.random() * 0.5, // Latitude
          ],
        },
        address: `${Math.floor(Math.random() * 1000)}, ${ward}, Bangalore`,
        userId: citizen._id,
        assignedTo: status !== 'pending' ? engineer._id : null,
        createdAt,
        updatedAt: resolutionDate || createdAt,
        resolutionDate,
        images: [],
      };

      grievances.push(grievance);
    }

    // Insert all grievances
    const result = await Grievance.insertMany(grievances);
    console.log(`\n✅ Successfully created ${result.length} sample grievances!`);

    // Show summary
    const statusCounts = await Grievance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    console.log('\n📊 Grievance Summary:');
    statusCounts.forEach((item) => {
      console.log(`  ${item._id}: ${item.count}`);
    });

    const resolvedCount = await Grievance.countDocuments({ status: 'resolved' });
    console.log(`\n✨ Total Resolved: ${resolvedCount} (ready for analytics!)`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedAnalyticsData();
