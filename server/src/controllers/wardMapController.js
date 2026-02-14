const Grievance = require('../models/Grievance');

const locationAnchors = {
  kosamba: { latitude: 21.4628, longitude: 72.9582 },
  surat: { latitude: 21.1702, longitude: 72.8311 },
};

const wardCenters = {
  1: { latitude: 21.1702, longitude: 72.8311 },
  2: { latitude: 21.1959, longitude: 72.8302 },
  3: { latitude: 21.1458, longitude: 72.7709 },
  4: { latitude: 21.1458, longitude: 72.8850 },
  5: { latitude: 21.1200, longitude: 72.8311 },
  6: { latitude: 21.2200, longitude: 72.8400 },
  7: { latitude: 21.2100, longitude: 72.7800 },
  8: { latitude: 21.1800, longitude: 72.8900 },
  9: { latitude: 21.1500, longitude: 72.8100 },
  10: { latitude: 21.1300, longitude: 72.7600 },
};

function toFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getWardNumber(location) {
  const wardMatch = location?.match(/Ward\s*(\d+)/i);
  return wardMatch ? Number(wardMatch[1]) : null;
}

function getStableOffset(seed, magnitude = 0.008) {
  const seedText = String(seed || 'default-seed');
  let hash = 0;

  for (let index = 0; index < seedText.length; index += 1) {
    hash = (hash << 5) - hash + seedText.charCodeAt(index);
    hash |= 0;
  }

  const normalized = ((Math.abs(hash) % 1000) / 1000) - 0.5;
  return normalized * magnitude;
}

function getCoordinatesForMap(grievance) {
  const latitude = toFiniteNumber(grievance.coordinates?.latitude);
  const longitude = toFiniteNumber(grievance.coordinates?.longitude);

  if (
    latitude !== null &&
    longitude !== null &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  ) {
    return { latitude, longitude };
  }

  const parsedCoordinates = parseCoordinatesFromLocation(grievance.location);
  if (parsedCoordinates) {
    return parsedCoordinates;
  }

  const wardNumber = getWardNumber(grievance.location);
  if (wardNumber && wardCenters[wardNumber]) {
    return {
      latitude: wardCenters[wardNumber].latitude + getStableOffset(`${grievance._id}-lat`),
      longitude: wardCenters[wardNumber].longitude + getStableOffset(`${grievance._id}-lng`),
    };
  }

  return {
    latitude: locationAnchors.surat.latitude + getStableOffset(`${grievance._id}-lat-default`),
    longitude: locationAnchors.surat.longitude + getStableOffset(`${grievance._id}-lng-default`),
  };
}

function parseCoordinatesFromLocation(location) {
  if (!location || typeof location !== 'string') {
    return null;
  }

  const coordinateMatch = location.match(/(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)/);
  if (coordinateMatch) {
    const latitude = Number(coordinateMatch[1]);
    const longitude = Number(coordinateMatch[2]);

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    ) {
      return { latitude, longitude };
    }
  }

  const normalizedLocation = location.toLowerCase();
  for (const [anchor, coords] of Object.entries(locationAnchors)) {
    if (normalizedLocation.includes(anchor)) {
      return coords;
    }
  }

  return null;
}

/**
 * Get ward-wise grievance statistics and map data
 */
exports.getWardMapData = async (req, res) => {
  try {
    const { status, category, priority } = req.query;

    // Build filter
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    // Fetch all grievances with location data
    const grievances = await Grievance.find(filter)
      .select('trackingId title category status priority location coordinates createdAt')
      .lean();

    // Parse ward information from location field
    // Assuming location format: "Ward 4, Area Name, City" or similar
    const wardData = {};
    const locationData = [];

    grievances.forEach((grievance) => {
      const wardMatch = grievance.location?.match(/Ward\s*(\d+)/i);
      const wardNumber = wardMatch ? wardMatch[1] : 'Others';
      const wardKey = wardNumber === 'Others' ? 'Others' : `Ward ${wardNumber}`;

      if (!wardData[wardKey]) {
        wardData[wardKey] = {
          wardName: wardKey,
          wardNumber: wardNumber,
          total: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
          rejected: 0,
          high: 0,
          medium: 0,
          low: 0,
          critical: 0,
        };
      }

      wardData[wardKey].total++;
      wardData[wardKey][grievance.status.replace('-', '')] =
        (wardData[wardKey][grievance.status.replace('-', '')] || 0) + 1;
      wardData[wardKey][grievance.priority] =
        (wardData[wardKey][grievance.priority] || 0) + 1;

      const coordinates = getCoordinatesForMap(grievance);

      locationData.push({
        _id: grievance._id,
        id: grievance._id,
        grievanceId: grievance.trackingId,
        trackingId: grievance.trackingId,
        title: grievance.title,
        category: grievance.category,
        status: grievance.status,
        priority: grievance.priority,
        location: grievance.location,
        ward: wardKey,
        coordinates,
        createdAt: grievance.createdAt,
      });
    });

    // Convert ward data to array and sort by total count
    const wardArray = Object.values(wardData).sort((a, b) => b.total - a.total);

    // Calculate summary statistics
    const summary = {
      totalGrievances: grievances.length,
      totalWards: wardArray.length,
      highDensityWards: wardArray.filter(w => w.total >= 20).length,
      mediumDensityWards: wardArray.filter(w => w.total >= 10 && w.total < 20).length,
      lowDensityWards: wardArray.filter(w => w.total < 10).length,
    };

    res.status(200).json({
      success: true,
      data: {
        wards: wardArray,
        locations: locationData,
        summary,
      },
    });
  } catch (error) {
    console.error('Error fetching ward map data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ward map data',
      error: error.message,
    });
  }
};

/**
 * Get detailed statistics for a specific ward
 */
exports.getWardDetails = async (req, res) => {
  try {
    const { wardNumber } = req.params;

    // Build location filter for the ward
    const locationRegex = new RegExp(`Ward\\s*${wardNumber}`, 'i');

    const grievances = await Grievance.find({ location: locationRegex })
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate statistics
    const stats = {
      total: grievances.length,
      byStatus: {},
      byCategory: {},
      byPriority: {},
      avgResolutionTime: 0,
      overdue: 0,
    };

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    grievances.forEach((g) => {
      // Status counts
      stats.byStatus[g.status] = (stats.byStatus[g.status] || 0) + 1;

      // Category counts
      stats.byCategory[g.category] = (stats.byCategory[g.category] || 0) + 1;

      // Priority counts
      stats.byPriority[g.priority] = (stats.byPriority[g.priority] || 0) + 1;

      // Resolution time
      if (g.resolutionDate) {
        const resTime = g.resolutionDate - g.createdAt;
        totalResolutionTime += resTime;
        resolvedCount++;
      }

      // Overdue (open for more than 7 days)
      if (['open', 'in-progress'].includes(g.status)) {
        const daysOpen = (Date.now() - new Date(g.createdAt)) / (1000 * 60 * 60 * 24);
        if (daysOpen > 7) {
          stats.overdue++;
        }
      }
    });

    if (resolvedCount > 0) {
      stats.avgResolutionTime = Math.round(totalResolutionTime / resolvedCount / (1000 * 60 * 60 * 24)); // in days
    }

    res.status(200).json({
      success: true,
      data: {
        wardNumber,
        stats,
        grievances: grievances.slice(0, 50), // Limit to 50 most recent
      },
    });
  } catch (error) {
    console.error('Error fetching ward details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ward details',
      error: error.message,
    });
  }
};

/**
 * Get GeoJSON data for map visualization
 */
exports.getGeoJSONData = async (req, res) => {
  try {
    const { status, priority, category } = req.query;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }

    const grievances = await Grievance.find(filter)
      .select('trackingId title category status priority location coordinates createdAt')
      .lean();

    // Create GeoJSON FeatureCollection using actual coordinates
    const features = grievances
      .map((g, index) => {
        const coords = getCoordinatesForMap(g);
        // Extract ward number
        const wardMatch = g.location ? g.location.match(/Ward\s*(\d+)/i) : null;
        const wardNumber = wardMatch ? parseInt(wardMatch[1]) : 0;

        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              coords.longitude,
              coords.latitude,
            ],
          },
          properties: {
            id: g._id,
            trackingId: g.trackingId,
            title: g.title,
            category: g.category,
            status: g.status,
            priority: g.priority,
            location: g.location,
            ward: wardNumber,
            createdAt: g.createdAt,
          },
        };
      });

    const geoJSON = {
      type: 'FeatureCollection',
      features,
    };

    res.status(200).json({
      success: true,
      data: geoJSON,
    });
  } catch (error) {
    console.error('Error generating GeoJSON:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate GeoJSON data',
      error: error.message,
    });
  }
};

/**
 * Get ward-wise trend data over time
 */
exports.getWardTrends = async (req, res) => {
  try {
    const { wardNumber, days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const filter = {
      createdAt: { $gte: startDate },
    };

    if (wardNumber && wardNumber !== 'all') {
      filter.location = new RegExp(`Ward\\s*${wardNumber}`, 'i');
    }

    const grievances = await Grievance.find(filter)
      .select('createdAt status category priority')
      .lean();

    // Group by date
    const dailyData = {};
    grievances.forEach((g) => {
      const date = new Date(g.createdAt).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          total: 0,
          open: 0,
          resolved: 0,
          inProgress: 0,
        };
      }
      dailyData[date].total++;
      if (g.status === 'open') dailyData[date].open++;
      if (g.status === 'resolved') dailyData[date].resolved++;
      if (g.status === 'in-progress') dailyData[date].inProgress++;
    });

    const trends = Object.values(dailyData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    res.status(200).json({
      success: true,
      data: trends,
    });
  } catch (error) {
    console.error('Error fetching ward trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ward trends',
      error: error.message,
    });
  }
};
