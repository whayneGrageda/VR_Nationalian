/**
 * Converts technical error messages into user-friendly ones
 */
export function getUserFriendlyError(error: unknown): string {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Unable to connect to the server. Please check your internet connection or try again later.';
  }

  if (error instanceof Error) {
    // JSON parsing errors (HTML returned instead of JSON)
    if (error.message.includes('Unexpected token') && error.message.includes('<!DOCTYPE')) {
      return 'Server error: The API endpoint is not responding correctly. Please contact support.';
    }

    if (error.message.includes('Unexpected token') || error.message.includes('JSON')) {
      return 'Server returned an invalid response. Please try again or contact support.';
    }

    // Network errors
    if (error.message.includes('NetworkError') || error.message.includes('Network request failed')) {
      return 'Network error. Please check your connection and try again.';
    }

    // Timeout errors
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      return 'Request timed out. The server is taking too long to respond.';
    }

    // Server errors
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return 'Server error. Please try again later or contact support.';
    }

    // Return the original message if it's already user-friendly
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Handles fetch responses and throws user-friendly errors
 */
export async function handleApiResponse(response: Response) {
  if (!response.ok) {
    let errorMessage = 'Request failed';
    
    try {
      const data = await response.json();
      errorMessage = data.error || data.message || errorMessage;
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || `Error ${response.status}`;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}
