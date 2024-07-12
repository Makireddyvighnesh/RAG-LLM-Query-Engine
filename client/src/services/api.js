// Placeholder for API service
export const sendMessage = async (message) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ text: 'Response from server', user: 'bot' });
      }, 1000);
    });
  };
  