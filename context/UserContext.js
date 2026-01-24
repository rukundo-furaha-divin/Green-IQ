import React, { createContext, useState } from 'react';

export const UserContext = createContext({ 
  user: null, 
  setUser: () => {},
  userType: null,
  setUserType: () => {}
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'citizen' or 'company'
  
  return (
    <UserContext.Provider value={{ user, setUser, userType, setUserType }}>
      {children}
    </UserContext.Provider>
  );
}; 