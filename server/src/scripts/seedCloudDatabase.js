require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Grievance = require('../models/Grievance');

// Helper functions
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Complaint templates by category (matching Grievance model exactly)
const complaintTemplates = {
  water: [
    { title: 'Water Supply Disruption', desc: 'No water supply for the past 3 days in our area. Urgent attention needed.' },
    { title: 'Contaminated Water', desc: 'Water coming from taps is dirty and has foul smell. Health hazard for residents.' },
    { title: 'Leaking Water Pipeline', desc: 'Major water leakage on main road causing wastage and waterlogging.' },
    { title: 'Low Water Pressure', desc: 'Very low water pressure in upper floors, making daily activities difficult.' },
    { title: 'Broken Water Meter', desc: 'Water meter is not working properly, showing incorrect readings.' },
    { title: 'Underground Water Leakage', desc: 'Suspected underground water pipe leakage, ground is always wet.' },
    { title: 'Irregular Water Supply', desc: 'Water supply timing is very irregular, no fixed schedule.' },
    { title: 'Water Tank Overflow', desc: 'Overhead water tank overflowing, wasting water and causing damage.' },
  ],
  waste: [
    { title: 'Garbage Not Collected', desc: 'Garbage has not been collected for over a week. Foul smell and flies everywhere.' },
    { title: 'Overflowing Dustbin', desc: 'Community dustbin is overflowing, waste scattered on streets.' },
    { title: 'Illegal Dumping', desc: 'People are dumping construction waste in public area illegally.' },
    { title: 'Broken Garbage Bins', desc: 'Municipal garbage bins are broken and need replacement.' },
    { title: 'No Segregation', desc: 'Waste segregation not being followed, mixed garbage collection.' },
    { title: 'Medical Waste Disposal', desc: 'Medical waste from clinic being disposed improperly in regular bins.' },
    { title: 'Plastic Waste Burning', desc: 'People burning plastic waste in open, causing air pollution.' },
    { title: 'Stray Animals in Garbage', desc: 'Stray dogs tearing garbage bags and spreading waste on roads.' },
  ],
  roads: [
    { title: 'Pothole on Main Road', desc: 'Large pothole on main road causing traffic issues and accidents.' },
    { title: 'Road Damage After Rain', desc: 'Road surface severely damaged after monsoon, needs urgent repair.' },
    { title: 'Broken Speed Breaker', desc: 'Speed breaker broken and causing vehicle damage.' },
    { title: 'Waterlogging on Road', desc: 'Severe waterlogging during rain due to poor drainage system.' },
    { title: 'Missing Road Signs', desc: 'Traffic signs and signboards missing at important junction.' },
    { title: 'Damaged Footpath', desc: 'Footpath tiles broken, dangerous for pedestrians.' },
    { title: 'Road Cave-in', desc: 'Road surface caving in, major safety hazard.' },
    { title: 'Uneven Road Surface', desc: 'Newly laid road has uneven surface, poor quality work.' },
    { title: 'Missing Manhole Cover', desc: 'Open manhole without cover on busy road, very dangerous.' },
  ],
  electric: [
    { title: 'Frequent Power Cuts', desc: 'Experiencing frequent power cuts 4-5 times daily, disrupting work.' },
    { title: 'Street Light Not Working', desc: 'Multiple street lights not working, area dark at night.' },
    { title: 'Exposed Electric Wires', desc: 'Electric wires hanging loose and exposed, safety hazard.' },
    { title: 'Transformer Issue', desc: 'Local transformer making loud noise, voltage fluctuation.' },
    { title: 'Power Outage', desc: 'Complete power outage since morning, no response from electricity board.' },
    { title: 'Faulty Electric Meter', desc: 'Electricity meter showing incorrect high readings.' },
    { title: 'Illegal Connections', desc: 'Illegal electricity connections being used in neighborhood.' },
    { title: 'Electric Pole Damage', desc: 'Electric pole tilted and damaged, risk of falling.' },
  ],
  sanitation: [
    { title: 'Blocked Drainage', desc: 'Drainage system completely blocked, sewage water overflowing.' },
    { title: 'Open Sewer Line', desc: 'Open sewer line on road, health hazard and foul smell.' },
    { title: 'Public Toilet Dirty', desc: 'Public toilet in very poor condition, not cleaned regularly.' },
    { title: 'Mosquito Breeding', desc: 'Stagnant water causing mosquito breeding, dengue risk.' },
    { title: 'Sewage Overflow', desc: 'Sewage overflowing from manholes into residential area.' },
    { title: 'No Public Toilets', desc: 'No public toilet facility in market area, unhygienic situation.' },
  ],
  healthcare: [
    { title: 'Lack of Medicine', desc: 'Government dispensary running out of basic medicines frequently.' },
    { title: 'Ambulance Delay', desc: 'Ambulance service very slow, taking hours to respond.' },
    { title: 'Hospital Staff Shortage', desc: 'Primary health center severely understaffed, long waiting times.' },
    { title: 'Broken Medical Equipment', desc: 'Essential medical equipment not working in health center.' },
  ],
  education: [
    { title: 'School Building Damage', desc: 'School building in poor condition, ceiling leaking during rain.' },
    { title: 'Teacher Shortage', desc: 'Government school has teacher shortage, classes not conducted regularly.' },
    { title: 'No Drinking Water', desc: 'No proper drinking water facility in school for children.' },
    { title: 'Broken School Furniture', desc: 'Desks and benches in school broken, students sitting on floor.' },
  ],
  administrative: [
    { title: 'Document Processing Delay', desc: 'Applied for birth certificate 2 months ago, still not received.' },
    { title: 'Office Staff Rude Behavior', desc: 'Municipal office staff very rude and uncooperative.' },
    { title: 'Corruption in License', desc: 'Asked for bribe for issuing trade license at municipal office.' },
    { title: 'Website Not Working', desc: 'Municipal corporation website not working, unable to pay bills online.' },
  ],
  other: [
    { title: 'Stray Dog Menace', desc: 'Pack of stray dogs attacking people, especially children.' },
    { title: 'Encroachment on Park', desc: 'Public park being encroached by vendors and illegal structures.' },
    { title: 'Noise Pollution', desc: 'Construction noise beyond permitted hours, disturbing residents.' },
    { title: 'Tree Cutting', desc: 'Unauthorized cutting of trees in residential colony.' },
  ],
};

// Indian cities and wards
const locations = [
  { city: 'Mumbai', wards: ['Andheri West', 'Bandra East', 'Borivali West', 'Kandivali East', 'Malad West', 'Vikhroli'] },
  { city: 'Delhi', wards: ['Rohini', 'Dwarka', 'Janakpuri', 'Saket', 'Connaught Place', 'Karol Bagh'] },
  { city: 'Bangalore', wards: ['Koramangala', 'Whitefield', 'Indiranagar', 'Jayanagar', 'Electronic City', 'Marathahalli'] },
  { city: 'Chennai', wards: ['T Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'Tambaram', 'Guindy'] },
  { city: 'Hyderabad', wards: ['Hitech City', 'Madhapur', 'Gachibowli', 'Kukatpally', 'Secunderabad', 'Banjara Hills'] },
  { city: 'Ahmedabad', wards: ['Satellite', 'Vastrapur', 'Maninagar', 'Naranpura', 'Bodakdev', 'Chandkheda'] },
  { city: 'Pune', wards: ['Kothrud', 'Viman Nagar', 'Hinjewadi', 'Aundh', 'Wakad', 'Hadapsar'] },
  { city: 'Kolkata', wards: ['Salt Lake', 'Park Street', 'Ballygunge', 'New Town', 'Rajarhat', 'Howrah'] },
  { city: 'Surat', wards: ['Vesu', 'Adajan', 'Varachha', 'Athwa', 'Rander', 'Citylight'] },
  { city: 'Jaipur', wards: ['Malviya Nagar', 'Vaishali Nagar', 'Raja Park', 'C-Scheme', 'Mansarovar', 'Jagatpura'] },
];

// Valid enums from Grievance model
const statuses = ['open', 'in-progress', 'resolved', 'closed'];
const priorities = ['low', 'medium', 'high', 'critical'];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Cloud');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed users
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create admin (required)
    const admin = await User.create({
      name: 'Admin Kalsaria',
      email: 'pdkalsaria@gmail.com',
      password: '123456',
      role: 'admin',
      phone: '+919876543210',
      isActive: true,
    });
    console.log('✅ Created Admin:', admin.email);

    // Create regular user (required)
    const user1 = await User.create({
      name: 'Jamunesh Sheta',
      email: 'jsheta15@gmail.com',
      password: '123456',
      role: 'user',
      phone: '+919876543211',
      isActive: true,
    });
    console.log('✅ Created User:', user1.email);

    // Create engineer (required)
    const engineer1 = await User.create({
      name: 'Engineering Student',
      email: '23se02cs114@ppsu.ac.in',
      password: '123456',
      role: 'engineer',
      phone: '+919876543212',
      engineerId: 'ENG-001',
      specialization: 'Civil Engineering',
      department: 'Public Works',
      isActive: true,
    });
    console.log('✅ Created Engineer:', engineer1.email);

    // Create additional users
    const additionalUsers = [];
    const userNames = [
      'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Gupta', 'Vikram Singh',
      'Anita Desai', 'Rohit Mehta', 'Deepa Iyer', 'Suresh Reddy', 'Kavita Nair',
      'Manoj Joshi', 'Rekha Pillai', 'Arun Verma', 'Pooja Malhotra', 'Sanjay Rao',
      'Neha Kapoor', 'Ashok Pandey', 'Divya Menon', 'Kiran Bhat', 'Sunita Agarwal'
    ];

    for (let i = 0; i < userNames.length; i++) {
      const user = await User.create({
        name: userNames[i],
        email: `user${i + 1}@grams.com`,
        password: '123456',
        role: 'user',
        phone: `+9198765432${13 + i}`,
        isActive: true,
      });
      additionalUsers.push(user);
    }
    console.log(`✅ Created ${additionalUsers.length} additional users`);

    // Create additional engineers
    const additionalEngineers = [];
    const engineerData = [
      { name: 'Sandeep Kumar', spec: 'Civil Engineering', dept: 'Roads' },
      { name: 'Meera Joshi', spec: 'Electrical Engineering', dept: 'Electricity' },
      { name: 'Ravi Shankar', spec: 'Civil Engineering', dept: 'Water Supply' },
      { name: 'Lakshmi Rao', spec: 'Environmental Engineering', dept: 'Waste Management' },
      { name: 'Prakash Reddy', spec: 'Civil Engineering', dept: 'Public Works' },
      { name: 'Anjali Verma', spec: 'Electrical Engineering', dept: 'Street Lighting' },
      { name: 'Suresh Babu', spec: 'Mechanical Engineering', dept: 'Water Treatment' },
      { name: 'Gayatri Devi', spec: 'Civil Engineering', dept: 'Sanitation' },
      { name: 'Mohan Lal', spec: 'Civil Engineering', dept: 'Roads' },
      { name: 'Savita Kumari', spec: 'Environmental Engineering', dept: 'Waste Management' },
    ];

    for (let i = 0; i < engineerData.length; i++) {
      const eng = await User.create({
        name: engineerData[i].name,
        email: `engineer${i + 2}@grams.com`,
        password: '123456',
        role: 'engineer',
        phone: `+9198765432${33 + i}`,
        engineerId: `ENG-${String(i + 2).padStart(3, '0')}`,
        specialization: engineerData[i].spec,
        department: engineerData[i].dept,
        isActive: true,
      });
      additionalEngineers.push(eng);
    }
    console.log(`✅ Created ${additionalEngineers.length} additional engineers`);

    return {
      admin,
      users: [user1, ...additionalUsers],
      engineers: [engineer1, ...additionalEngineers],
    };
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

// Seed grievances - exactly matching Grievance model
const seedGrievances = async (users, engineers) => {
  try {
    await Grievance.deleteMany({});
    console.log('🗑️  Cleared existing grievances');

    const grievances = [];
    const targetCount = 135;
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    // Ensure even distribution among engineers
    const grievancesPerEngineer = Math.ceil(targetCount * 0.7 / engineers.length); // 70% of grievances assigned
    let engineerIndex = 0;

    for (let i = 0; i < targetCount; i++) {
      const categories = Object.keys(complaintTemplates);
      const category = randomPick(categories);
      const template = randomPick(complaintTemplates[category]);
      
      const location = randomPick(locations);
      const ward = randomPick(location.wards);
      const user = randomPick(users);
      const status = randomPick(statuses);
      const priority = randomPick(priorities);
      
      const createdAt = randomDate(sixMonthsAgo, now);
      const daysOpen = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
      
      // Build grievance matching exact model schema
      const grievanceData = {
        title: `${template.title} in ${ward}`,
        description: `${template.desc} Location: ${ward}, ${location.city}. This issue requires immediate attention from concerned authorities.`,
        category: category, // Must match enum: water, waste, roads, electric, administrative, healthcare, education, sanitation, other
        priority: priority, // Must match enum: low, medium, high, critical
        status: status, // Must match enum: open, in-progress, resolved, closed (not using rejected/blocked for seed)
        userId: user._id,
        userEmail: user.email,
        daysOpen: daysOpen,
        location: `${ward}, ${location.city}, PIN: ${400000 + Math.floor(Math.random() * 99999)}`, // String type
        upvotes: Math.floor(Math.random() * 20),
        isEscalated: false,
        reopenedCount: 0,
        createdAt: createdAt,
        updatedAt: createdAt,
      };

      // Assign to engineer if status is in-progress, resolved, or closed
      // Also ensure fair distribution among engineers
      if (status === 'in-progress' || status === 'resolved' || status === 'closed') {
        // Round-robin assignment to ensure all engineers get grievances
        const engineer = engineers[engineerIndex % engineers.length];
        engineerIndex++;
        
        const assignedDate = new Date(createdAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000);
        
        grievanceData.assignedTo = engineer._id;
        grievanceData.assignedAt = assignedDate;
        grievanceData.firstAssignedAt = assignedDate;
        grievanceData.workStartedAt = assignedDate;
        
        // Add budget for some grievances
        if (Math.random() > 0.5) {
          const estimatedCost = Math.floor(Math.random() * 50000) + 5000;
          const actualCost = Math.floor(Math.random() * 40000) + 3000;
          
          // Map grievance category to budget.category enum (water, roads, electricity, waste, other)
          let budgetCategory = 'other';
          if (category === 'water') budgetCategory = 'water';
          else if (category === 'roads') budgetCategory = 'roads';
          else if (category === 'electric') budgetCategory = 'electricity';
          else if (category === 'waste') budgetCategory = 'waste';
          
          grievanceData.budget = {
            allocated: estimatedCost,
            spent: status === 'resolved' || status === 'closed' ? actualCost : Math.floor(actualCost * 0.6),
            estimatedCost: estimatedCost,
            actualCost: status === 'resolved' || status === 'closed' ? actualCost : 0,
            budgetApproved: true,
            category: budgetCategory,
          };
        }
      }

      // Add resolution info for resolved/closed status
      if (status === 'resolved' || status === 'closed') {
        const resolvedDate = new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
        const daysToComplete = Math.max(1, Math.floor((resolvedDate - (grievanceData.workStartedAt || createdAt)) / (1000 * 60 * 60 * 24)));
        
        grievanceData.resolution = 'Issue has been resolved successfully. All necessary repairs and work have been completed as per requirements.';
        grievanceData.resolutionDate = resolvedDate;
        grievanceData.resolvedAt = resolvedDate;
        grievanceData.workCompletedAt = resolvedDate;
        grievanceData.daysToComplete = daysToComplete;
        grievanceData.citizenRating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
      }

      // Escalate some old open grievances
      if (daysOpen > 15 && status === 'open' && Math.random() > 0.7) {
        grievanceData.isEscalated = true;
        grievanceData.escalatedAt = new Date(createdAt.getTime() + 15 * 24 * 60 * 60 * 1000);
      }

      const grievance = await Grievance.create(grievanceData);
      grievances.push(grievance);
    }

    console.log(`✅ Created ${grievances.length} grievances`);

    // Statistics by engineer
    console.log('\n📊 Distribution by Engineer:');
    for (const engineer of engineers) {
      const assigned = grievances.filter(g => g.assignedTo && g.assignedTo.toString() === engineer._id.toString()).length;
      if (assigned > 0) {
        console.log(`   ${engineer.name}: ${assigned} grievances`);
      }
    }

    // Overall statistics
    const stats = {
      open: grievances.filter(g => g.status === 'open').length,
      inProgress: grievances.filter(g => g.status === 'in-progress').length,
      resolved: grievances.filter(g => g.status === 'resolved').length,
      closed: grievances.filter(g => g.status === 'closed').length,
      escalated: grievances.filter(g => g.isEscalated).length,
    };
    console.log('\n📊 Overall Statistics:', stats);

    return grievances;
  } catch (error) {
    console.error('❌ Error seeding grievances:', error);
    throw error;
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    await connectDB();
    
    const { admin, users, engineers } = await seedUsers();
    console.log('\n✅ User seeding completed');
    console.log(`   - 1 Admin`);
    console.log(`   - ${users.length} Regular Users`);
    console.log(`   - ${engineers.length} Engineers`);
    
    const grievances = await seedGrievances(users, engineers);
    console.log('\n✅ Grievance seeding completed');
    console.log(`   - ${grievances.length} Total Complaints`);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Admin: pdkalsaria@gmail.com / 123456');
    console.log('   User: jsheta15@gmail.com / 123456');
    console.log('   Engineer: 23se02cs114@ppsu.ac.in / 123456');
    console.log('\n   Additional users: user1@grams.com to user20@grams.com / 123456');
    console.log('   Additional engineers: engineer2@grams.com to engineer11@grams.com / 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
