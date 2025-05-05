import { Platform } from 'react-native';
import { getUserInfo } from './KeycloakService';

const MIXPANEL_PROJECT_TOKEN = 'c0910617b8126855004d8d261079ca70';

export const trackEvent = async (eventName: string, properties: Record<string, any> = {}) => {
  let distinctId = 'anonymous_user_id';
  
  // Try to get the user's email from Keycloak
  try {
    const userInfo = await getUserInfo();
    if (userInfo && userInfo.email) {
      distinctId = userInfo.email;
    }
  } catch (error) {
    console.log('User not authenticated, using anonymous ID');
  }
  
  const event = {
    event: eventName,
    properties: {
      token: MIXPANEL_PROJECT_TOKEN,
      distinct_id: distinctId,
      platform: Platform.OS,
      time: Math.floor(Date.now() / 1000),
      ...properties,
    },
  };

  const payload = btoa(JSON.stringify([event])); // Base64 encode

  try {
    await fetch('https://api.mixpanel.com/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${payload}`,
    });
    console.log('Mixpanel event sent:', eventName);
  } catch (err) {
    console.error('Mixpanel event failed:', err);
  }
};

export const identifyUser = async (distinctId?: string, userProps: Record<string, any> = {}) => {
  // If no distinctId provided, try to get email from Keycloak
  if (!distinctId) {
    try {
      const userInfo = await getUserInfo();
      if (userInfo && userInfo.email) {
        distinctId = userInfo.email;
        
        // Add user properties from Keycloak if available
        if (!Object.keys(userProps).length) {
          userProps = {
            $email: userInfo.email,
            $first_name: userInfo.firstName,
            $last_name: userInfo.lastName,
            $phone: userInfo.phoneNumber,
          };
        }
      }
    } catch (error) {
      console.log('User not authenticated, cannot identify');
      return;
    }
  }
  
  // Don't proceed if we still don't have a distinctId
  if (!distinctId) {
    console.log('No distinct ID available, skipping identify');
    return;
  }

  const payload = btoa(JSON.stringify({
    $token: MIXPANEL_PROJECT_TOKEN,
    $distinct_id: distinctId,
    $set: userProps,
  }));

  await fetch('https://api.mixpanel.com/engage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${payload}`,
  });
};
