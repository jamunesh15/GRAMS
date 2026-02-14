export const normalizeStatus = (status) => (status || '').toString().trim().toLowerCase();

export const getStatusBucket = (status) => {
  const normalizedStatus = normalizeStatus(status);
  if (normalizedStatus === 'pending' || normalizedStatus === 'rejected') return normalizedStatus;
  if (['approved', 'partially-approved', 'delivered', 'refetched'].includes(normalizedStatus)) {
    return 'approved';
  }
  return 'approved';
};

export const buildRequestStats = (requests = []) => {
  return requests.reduce(
    (acc, request) => {
      acc.total += 1;
      const bucket = getStatusBucket(request.status);
      if (bucket === 'pending') acc.pending += 1;
      if (bucket === 'approved') acc.approved += 1;
      if (bucket === 'rejected') acc.rejected += 1;
      return acc;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0 }
  );
};
