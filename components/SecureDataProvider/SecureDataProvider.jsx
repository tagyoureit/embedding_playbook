import React, { createContext, useState, useContext } from 'react';

// Create a context
export const SecureDataContext = createContext();


export const SecureDataProvider = ({ children }) => {
  // Define state variables for secure data
  const [secureData, setSecureData] = useState({
    tableauUrl: '',
    userName: '',
    siteName: '',
    caClientId: '',
    caSecretId: '',
    caSecretValue: '',
    isReady: false
  });
  
  // Function to update secure data
  const updateSecureData = (newData) => {
    const isReady = newData.userName === '' ? false : true;
    setSecureData({ ...secureData, ...newData, isReady});
  };

  return (
    <SecureDataContext.Provider value={{secureData, updateSecureData}}>
      {children}
    </SecureDataContext.Provider>
  );
};
