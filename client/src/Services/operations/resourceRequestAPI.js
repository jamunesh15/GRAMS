import axios from 'axios';
import { resourceRequestEndpoints } from '../apis';

const {
  CREATE_RESOURCE_REQUEST,
  GET_ALL_RESOURCE_REQUESTS,
  GET_PENDING_REQUESTS,
  GET_MY_REQUESTS,
  GET_RESOURCE_REQUEST_BY_ID,
  APPROVE_RESOURCE_REQUEST,
  REJECT_RESOURCE_REQUEST,
  MARK_AS_DELIVERED,
  GET_REQUEST_STATS,
  GET_ALLOCATED_RESOURCES,
  REFETCH_AMOUNT,
} = resourceRequestEndpoints;

export async function createResourceRequest(token, requestData) {
  return await axios.post(CREATE_RESOURCE_REQUEST, requestData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getAllResourceRequests(token) {
  return await axios.get(GET_ALL_RESOURCE_REQUESTS, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getPendingRequests(token) {
  return await axios.get(GET_PENDING_REQUESTS, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getMyRequests(token) {
  return await axios.get(GET_MY_REQUESTS, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getResourceRequestById(token, requestId) {
  return await axios.get(GET_RESOURCE_REQUEST_BY_ID(requestId), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function approveResourceRequest(token, requestId, approvalData) {
  return await axios.put(APPROVE_RESOURCE_REQUEST(requestId), approvalData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function rejectResourceRequest(token, requestId, rejectionData) {
  return await axios.put(REJECT_RESOURCE_REQUEST(requestId), rejectionData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function markAsDelivered(token, requestId) {
  return await axios.put(MARK_AS_DELIVERED(requestId), {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getRequestStats(token) {
  return await axios.get(GET_REQUEST_STATS, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getAllocatedResources(token) {
  return await axios.get(GET_ALLOCATED_RESOURCES, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function refetchRemainingAmount(token, requestId, refetchData) {
  return await axios.post(REFETCH_AMOUNT(requestId), refetchData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
