import { PublicClientApplication } from '@azure/msal-browser';

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '0513db68-c2db-4f08-99ff-8b210552d7fe',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

// Login request scopes
export const loginRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
};

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL
export const initializeMsal = async () => {
  try {
    await msalInstance.initialize();
    console.log('✅ MSAL initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ MSAL initialization error:', error);
    return false;
  }
};

// Sign in with Microsoft
export const signInWithMicrosoft = async () => {
  try {
    // Ensure MSAL is initialized
    await initializeMsal();
    
    // Try popup login
    const response = await msalInstance.loginPopup(loginRequest);
    
    if (response) {
      // Get user info from Microsoft Graph
      const userInfo = await getMicrosoftUserInfo(response.accessToken);
      
      return {
        success: true,
        user: {
          name: userInfo.displayName || response.account?.name || '',
          email: userInfo.mail || userInfo.userPrincipalName || response.account?.username || '',
          microsoftId: response.account?.localAccountId || '',
          profilePicture: '', // Microsoft Graph photo requires separate API call
        },
        accessToken: response.accessToken,
      };
    }
    
    throw new Error('No response from Microsoft login');
  } catch (error) {
    console.error('Microsoft sign-in error:', error);
    throw error;
  }
};

// Get user info from Microsoft Graph API
const getMicrosoftUserInfo = async (accessToken) => {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user info from Microsoft Graph');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Microsoft user info:', error);
    return {};
  }
};

// Sign out from Microsoft
export const signOutFromMicrosoft = async () => {
  try {
    await msalInstance.logoutPopup();
    return true;
  } catch (error) {
    console.error('Microsoft sign-out error:', error);
    return false;
  }
};

export default msalInstance;
