import { useState, useContext, createContext, useEffect } from 'react';

// Create a context to share authentication state
const AuthContext = createContext(null);

// Provider component that wraps your app and makes auth available
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if there's a stored session on first load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login method
  const login = (email, password) => {
    // This would normally call an API, but for demo we just simulate it
    console.log(`Logging in with ${email} and password`);
    
    // Simulate successful login response
    const userData = { 
      id: '123', 
      email, 
      name: 'Demo User',
      role: 'user'
    };
    
    // Save in state and localStorage for persistence
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };

  // Logout method
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Register method
  const register = (email, password, name) => {
    console.log(`Registering ${name} with ${email} and password`);
    
    // Simulate successful registration and auto-login
    const userData = { 
      id: '123', 
      email, 
      name,
      role: 'user' 
    };
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };

  // Context value
  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth; 