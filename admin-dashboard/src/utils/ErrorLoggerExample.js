// Example usage of ErrorLogger in your components

import React, { useEffect } from 'react';
import ErrorLogger from '../utils/ErrorLogger';

// Example component showing how to use ErrorLogger
const ExampleComponent = () => {
  useEffect(() => {
    // Example: Log when component mounts
    ErrorLogger.logInfo('ExampleComponent mounted', {
      component: 'ExampleComponent',
      userId: 'current-user-id' // You can get this from your auth context
    });
  }, []);

  const handleSomeAction = async () => {
    try {
      // Your code here
      const result = await someApiCall();

      // Log success
      ErrorLogger.logInfo('Action completed successfully', {
        action: 'someAction',
        result: result
      });

    } catch (error) {
      // Log error with context
      ErrorLogger.logError(error, {
        action: 'someAction',
        component: 'ExampleComponent',
        userId: 'current-user-id'
      });

      // Handle error in UI
      console.error('Action failed:', error);
    }
  };

  const handleWarningExample = () => {
    // Log warnings for non-critical issues
    ErrorLogger.logWarning('This is a warning message', {
      component: 'ExampleComponent',
      reason: 'Some validation failed but not critical'
    });
  };

  return (
    <div>
      <h1>Example Component</h1>
      <button onClick={handleSomeAction}>Test Action</button>
      <button onClick={handleWarningExample}>Test Warning</button>
    </div>
  );
};

export default ExampleComponent;
