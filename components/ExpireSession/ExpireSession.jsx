import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';

const ExpireSessionsButton = () => {
  const queryClient = useQueryClient();

  const handleExpireSessions = async () => {
    try {
      // Call the API route to expire sessions
      const response = await fetch('/api/sessions', {
        method: 'POST',
      });

      if (response.ok) {
        // Invalidate all queries
        queryClient.invalidateQueries();

        // Optionally sign out the user
        await signOut();

        alert('All sessions expired');
      } else {
        const data = await response.json();
        console.error(data.error);
      }
    } catch (error) {
      console.error('Failed to expire sessions:', error);
    }
  };

  return (
    <button
      onClick={handleExpireSessions}
      style={{
        backgroundColor: 'gray',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
    >
      Expire Sessions
    </button>
  );
};

export default ExpireSessionsButton;
