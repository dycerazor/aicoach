
'use server';

export async function getSimliToken() {
  const SIMLI_API_KEY = process.env.SIMLI_API_KEY;
  
  if (!SIMLI_API_KEY) {
    // In a real app, this would be an error, but for boilerplate we can log it.
    console.warn("SIMLI_API_KEY is missing from environment variables.");
    // Return a mock or handle gracefully
    return null;
  }

  try {
    const response = await fetch('https://api.simli.ai/getToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: SIMLI_API_KEY,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch Simli token');
    }

    const data = await response.json();
    return data.session_token;
  } catch (error) {
    console.error('Error getting Simli token:', error);
    return null;
  }
}
