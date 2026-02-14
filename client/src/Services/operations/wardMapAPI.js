import { apiconnector } from '../apiconnector';
import { wardMapEndpoints } from '../apis';

const {
  GET_WARD_MAP_DATA_API,
  GET_WARD_DETAILS_API,
  GET_GEOJSON_DATA_API,
  GET_WARD_TRENDS_API,
} = wardMapEndpoints;

/**
 * Get ward-wise grievance statistics and map data
 */
export const getWardMapData = async (token, filters = {}) => {
  try {
    const { status, category, priority } = filters;
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    if (priority) params.append('priority', priority);

    const queryString = params.toString();
    const url = queryString ? `${GET_WARD_MAP_DATA_API}?${queryString}` : GET_WARD_MAP_DATA_API;

    const response = await apiconnector('GET', url, null, {
      Authorization: `Bearer ${token}`,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching ward map data:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get detailed statistics for a specific ward
 */
export const getWardDetails = async (token, wardNumber) => {
  try {
    const response = await apiconnector(
      'GET',
      `${GET_WARD_DETAILS_API}/${wardNumber}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching ward details:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get GeoJSON data for map visualization
 */
export const getGeoJSONData = async (token, filters = {}) => {
  try {
    const { status, priority, category } = filters;
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (category) params.append('category', category);

    const queryString = params.toString();
    const url = queryString ? `${GET_GEOJSON_DATA_API}?${queryString}` : GET_GEOJSON_DATA_API;

    const response = await apiconnector('GET', url, null, {
      Authorization: `Bearer ${token}`,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching GeoJSON data:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get ward-wise trend data over time
 */
export const getWardTrends = async (token, wardNumber = 'all', days = 30) => {
  try {
    const params = new URLSearchParams();
    params.append('wardNumber', wardNumber);
    params.append('days', days);

    const response = await apiconnector(
      'GET',
      `${GET_WARD_TRENDS_API}?${params.toString()}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching ward trends:', error);
    throw error.response?.data || error;
  }
};
