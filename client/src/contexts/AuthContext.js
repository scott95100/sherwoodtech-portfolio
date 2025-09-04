import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from '../utils/axios';
import toast from 'react-hot-toast';

// Create Auth Context
const AuthContext = createContext();

// Initial State
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

// Auth Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
        error: null
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user
  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      dispatch({
        type: 'USER_LOADED',
        payload: res.data.user
      });
    } catch (err) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response?.data?.message || 'Authentication failed'
      });
    }
  };

  // Register user
  const register = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await axios.post('/api/auth/register', formData, config);
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data
      });

      toast.success('Registration successful!');
      loadUser();
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'REGISTER_FAIL',
        payload: errorMsg
      });
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Login user
  const login = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await axios.post('/api/auth/login', formData, config);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data
      });

      toast.success('Login successful!');
      
      // Don't call loadUser here since we already have the user data from login response
      return { success: true, user: res.data.user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAIL',
        payload: errorMsg
      });
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  // Clear errors
  const clearErrors = () => dispatch({ type: 'CLEAR_ERRORS' });

  // Load user on app start
  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        login,
        logout,
        loadUser,
        clearErrors
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
