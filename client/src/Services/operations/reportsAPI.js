import { apiconnector } from '../apiconnector';
import { reportEndpoints } from '../apis';

const {
  GENERATE_REPORT_API,
  GET_REPORT_HISTORY_API,
  DOWNLOAD_REPORT_API,
  GET_REPORT_PREVIEW_API,
  GET_RECENT_REPORTS_API,
  DOWNLOAD_REPORT_FILE_API
} = reportEndpoints;

// Generate report
export const generateReport = async (token, period) => {
  try {
    const response = await apiconnector('POST', GENERATE_REPORT_API, 
      { period },
      { Authorization: `Bearer ${token}` }
    );
    return response;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

// Get report history
export const getReportHistory = async (token) => {
  try {
    const response = await apiconnector('GET', GET_REPORT_HISTORY_API, 
      null,
      { Authorization: `Bearer ${token}` }
    );
    return response;
  } catch (error) {
    console.error('Error fetching report history:', error);
    throw error;
  }
};

// Download report
export const downloadReport = async (token, period) => {
  try {
    const response = await fetch(`${DOWNLOAD_REPORT_API}?period=${period}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('content-disposition');
    let filename = `report_${period}_${new Date().toLocaleDateString()}.pdf`;
    if (contentDisposition) {
      const matches = /filename="?([^"]+)"?/.exec(contentDisposition);
      if (matches && matches[1]) {
        filename = matches[1];
      }
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
};

// Get report preview
export const getReportPreview = async (token, period) => {
  try {
    const response = await apiconnector('GET', `${GET_REPORT_PREVIEW_API}?period=${period}`, 
      null,
      { Authorization: `Bearer ${token}` }
    );
    return response;
  } catch (error) {
    console.error('Error fetching report preview:', error);
    throw error;
  }
};

// Get recent reports
export const getRecentReports = async (token) => {
  try {
    const response = await apiconnector('GET', GET_RECENT_REPORTS_API, 
      null,
      { Authorization: `Bearer ${token}` }
    );
    return response;
  } catch (error) {
    console.error('Error fetching recent reports:', error);
    throw error;
  }
};

// Download report by filename
export const downloadReportFile = async (token, filename) => {
  try {
    const response = await fetch(`${DOWNLOAD_REPORT_FILE_API}/${filename}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Error downloading report file:', error);
    throw error;
  }
};;
