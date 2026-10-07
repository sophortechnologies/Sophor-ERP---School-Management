// src/modules/fee-accounting/hooks/useFee.js
import { useState, useEffect } from 'react';
import { feeApi } from '../api';
import { toast } from 'react-toastify';

export const useFee = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createFeeConfig = async (configData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await feeApi.createFeeConfig(configData);
      toast.success('Fee configuration created successfully');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create fee configuration');
      toast.error('Failed to create fee configuration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getFeeConfigs = async (params = {}) => {
    setLoading(true);
    try {
      const response = await feeApi.getFeeConfigs(params);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch fee configurations');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getFeeConfigsByClass = async (classId) => {
    setLoading(true);
    try {
      const response = await feeApi.getFeeConfigsByClass(classId);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch fee configurations');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateFeeConfig = async (id, configData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await feeApi.updateFeeConfig(id, configData);
      toast.success('Fee configuration updated successfully');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update fee configuration');
      toast.error('Failed to update fee configuration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFeeConfig = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await feeApi.softDeleteFeeConfig(id);
      toast.success('Fee configuration deleted successfully');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete fee configuration');
      toast.error('Failed to delete fee configuration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createFeeConfig,
    getFeeConfigs,
    getFeeConfigsByClass,
    updateFeeConfig,
    deleteFeeConfig,
  };
};