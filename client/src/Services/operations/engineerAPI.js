import { apiconnector } from '../apiconnector';
import { engineerEndpoints } from '../apis';

const {
  CREATE_ENGINEER_API,
  GET_ALL_ENGINEERS_API,
  GET_ENGINEER_STATS_API,
  GET_ENGINEER_BY_ID_API,
  UPDATE_ENGINEER_API,
  DELETE_ENGINEER_API,
  ASSIGN_GRIEVANCE_API,
  UNASSIGN_GRIEVANCE_API,
  SEND_MESSAGE_API,
} = engineerEndpoints;

// Create new engineer
export const createEngineer = async (engineerData, token) => {
  try {
    console.log('API Request: POST', CREATE_ENGINEER_API);
    console.log('Request data:', engineerData);

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const response = await apiconnector('POST', CREATE_ENGINEER_API, engineerData, headers);

    console.log('CREATE ENGINEER API RESPONSE:', response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || 'Failed to create engineer');
    }

    return response.data;
  } catch (error) {
    console.error('CREATE ENGINEER API ERROR:', error);
    throw error;
  }
};

// Get all engineers
export const getAllEngineers = async (token, filters = {}) => {
  try {
    console.log('API Request: GET', GET_ALL_ENGINEERS_API);

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.specialization) params.specialization = filters.specialization;

    const response = await apiconnector('GET', GET_ALL_ENGINEERS_API, null, headers, params);

    console.log('GET ALL ENGINEERS API RESPONSE:', response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || 'Failed to fetch engineers');
    }

    return response.data;
  } catch (error) {
    console.error('GET ALL ENGINEERS API ERROR:', error);
    throw error;
  }
};

// Get engineer statistics
export const getEngineerStats = async (token) => {
  try {
    console.log('API Request: GET', GET_ENGINEER_STATS_API);

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await apiconnector('GET', GET_ENGINEER_STATS_API, null, headers);

    console.log('GET ENGINEER STATS API RESPONSE:', response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || 'Failed to fetch engineer stats');
    }

    return response.data;
  } catch (error) {
    console.error('GET ENGINEER STATS API ERROR:', error);
    throw error;
  }
};

// Get engineer by ID
export const getEngineerById = async (engineerId, token) => {
  try {
    const url = `${GET_ENGINEER_BY_ID_API}/${engineerId}`;
    console.log('API Request: GET', url);

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await apiconnector('GET', url, null, headers);

    console.log('GET ENGINEER BY ID API RESPONSE:', response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || 'Failed to fetch engineer');
    }

    return response.data;
  } catch (error) {
    console.error('GET ENGINEER BY ID API ERROR:', error);
    throw error;
  }
};

// Update engineer
export const updateEngineer = async (engineerId, updateData, token) => {
  try {
    const url = `${UPDATE_ENGINEER_API}/${engineerId}`;
    console.log('API Request: PUT', url);
    console.log('Request data:', updateData);

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const response = await apiconnector('PUT', url, updateData, headers);

    console.log('UPDATE ENGINEER API RESPONSE:', response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || 'Failed to update engineer');
    }

    return response.data;
  } catch (error) {
    console.error('UPDATE ENGINEER API ERROR:', error);
    throw error;
  }
};

// Delete engineer
export const deleteEngineer = async (engineerId, token) => {
  try {
    const url = `${DELETE_ENGINEER_API}/${engineerId}`;
    console.log('API Request: DELETE', url);

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await apiconnector('DELETE', url, null, headers);

    console.log('DELETE ENGINEER API RESPONSE:', response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || 'Failed to delete engineer');
    }

    return response.data;
  } catch (error) {
    console.error('DELETE ENGINEER API ERROR:', error);
    throw error;
  }
};

// Assign grievance to engineer
export const assignGrievance = async (assignmentData, token) => {
  try {
    console.log('API Request: POST', ASSIGN_GRIEVANCE_API);
    console.log('Request data:', assignmentData);

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const response = await apiconnector('POST', ASSIGN_GRIEVANCE_API, assignmentData, headers);

    console.log('ASSIGN GRIEVANCE API RESPONSE:', response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || 'Failed to assign grievance');
    }

    return response.data;
  } catch (error) {
    console.error('ASSIGN GRIEVANCE API ERROR:', error);
    throw error;
  }
};

// Unassign grievance from engineer
export const unassignGrievance = async (grievanceId, token) => {
  try {
    console.log('API Request: POST', UNASSIGN_GRIEVANCE_API);
    console.log('Request data:', { grievanceId });

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const response = await apiconnector('POST', UNASSIGN_GRIEVANCE_API, { grievanceId }, headers);

    console.log('UNASSIGN GRIEVANCE API RESPONSE:', response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || 'Failed to unassign grievance');
    }

    return response.data;
  } catch (error) {
    console.error('UNASSIGN GRIEVANCE API ERROR:', error);
    throw error;
  }
};

// Send message to engineer
export const sendMessageToEngineer = async (messageData, token) => {
  try {
    console.log('API Request: POST', SEND_MESSAGE_API);
    console.log('Request data:', messageData);

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const response = await apiconnector('POST', SEND_MESSAGE_API, messageData, headers);

    console.log('SEND MESSAGE API RESPONSE:', response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || 'Failed to send message');
    }

    return response.data;
  } catch (error) {
    console.error('SEND MESSAGE API ERROR:', error);
    throw error;
  }
};
