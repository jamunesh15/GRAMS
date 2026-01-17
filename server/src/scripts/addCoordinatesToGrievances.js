const mongoose = require('mongoose');
const Grievance = require('../models/Grievance');
const path = require('path');
const fs = require('fs');

// Read .env file manually
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envLines = envContent.split('\n');
  envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      process.env[key.trim()] = value;
    }
  });
}

/**
 * Migration script to add coordinates to existing grievances
 * Based on Surat/Kosamba area wards
 */

// Surat/Kosamba ward coordinates (approximate)
const wardCoordinates = {
  1: { lat: 21.1702, lng: 72.8311 }, // Central Surat
  2: { lat: 21.1959, lng: 72.8302 }, // North Surat
  3: { lat: 21.1458, lng: 72.7709 }, // West Surat
  4: { lat: 21.1458, lng: 72.8850 }, // East Surat (Kosamba area)
  5: { lat: 21.1200, lng: 72.8311 }, // South Surat
  6: { lat: 21.2200, lng: 72.8400 }, // Katargam
  7: { lat: 21.2100, lng: 72.7800 }, // Athwa
  8: { lat: 21.1800, lng: 72.8900 }, // Adajan
  9: { lat: 21.1500, lng: 72.8100 }, // Rander
  10: { lat: 21.1300, lng: 72.7600 }, // Magdalla
};

const addCoordinates = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    const grievances = await Grievance.find({
      $or: [
        { coordinates: { $exists: false } },
        { 'coordinates.latitude': { $exists: false } },
        { 'coordinates.longitude': { $exists: false } },
      ],
    });

    console.log(`Found ${grievances.length} grievances without coordinates`);

    let updated = 0;
    for (const grievance of grievances) {
      let lat, lng;

      // Try to extract ward number from location
      const wardMatch = grievance.location ? grievance.location.match(/Ward\s*(\d+)/i) : null;
      
      if (wardMatch) {
        const wardNum = parseInt(wardMatch[1]);
        const wardCoord = wardCoordinates[wardNum];
        
        if (wardCoord) {
          // Use ward coordinates with small random offset for variety
          lat = wardCoord.lat + (Math.random() * 0.01 - 0.005);
          lng = wardCoord.lng + (Math.random() * 0.01 - 0.005);
        } else {
          // Unknown ward, use central Surat with random offset
          lat = 21.1702 + (Math.random() * 0.02 - 0.01);
          lng = 72.8311 + (Math.random() * 0.02 - 0.01);
        }
      } else {
        // No ward info, use central Surat with random offset
        lat = 21.1702 + (Math.random() * 0.02 - 0.01);
        lng = 72.8311 + (Math.random() * 0.02 - 0.01);
      }

      // Update grievance with coordinates
      grievance.coordinates = {
        latitude: lat,
        longitude: lng,
      };

      await grievance.save();
      updated++;

      if (updated % 10 === 0) {
        console.log(`Updated ${updated} grievances...`);
      }
    }

    console.log(`\nMigration completed!`);
    console.log(`Total grievances updated: ${updated}`);

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

addCoordinates();
