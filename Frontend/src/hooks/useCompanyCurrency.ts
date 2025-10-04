import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { companyAPI } from '@/services/api';

export const useCompanyCurrency = () => {
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCompanyCurrency = async () => {
      if (user?.companyId) {
        try {
          setLoading(true);
          const company = await companyAPI.getCompany();
          setCurrency(company.currency || 'USD');
        } catch (error) {
          console.error('Failed to fetch company currency:', error);
          setCurrency('USD'); // Fallback to USD
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchCompanyCurrency();
  }, [user?.companyId]);

  return { currency, loading };
};
