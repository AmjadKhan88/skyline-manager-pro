// hooks/useQueryParams.js
import { useSearchParams } from 'react-router-dom';

export function useQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get all params as an object
  const getAllParams = () => {
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    return params;
  };
  
  // Get a specific parameter
  const getParam = (key) => searchParams.get(key);
  
  // Set a parameter
  const setParam = (key, value) => {
    setSearchParams(prev => {
      prev.set(key, value);
      return prev;
    });
  };
  
  // Remove a parameter
  const removeParam = (key) => {
    setSearchParams(prev => {
      prev.delete(key);
      return prev;
    });
  };
  
  // Set multiple parameters
  const setParams = (paramsObj) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      Object.entries(paramsObj).forEach(([key, value]) => {
        newParams.set(key, value);
      });
      return newParams;
    });
  };
  
  return {
    params: getAllParams(),
    getParam,
    setParam,
    removeParam,
    setParams,
    searchParams // raw searchParams object
  };
}