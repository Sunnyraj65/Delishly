import { useEffect, useState } from 'react';
import { db } from 'lib/supabase';
import { useAuth } from 'contexts/AuthContext';

/**
 * Custom hook to fetch and expose the authenticated user's orders.
 *
 * Returns an object with:
 *  - orders: array|null  (null while loading, [] when no orders)
 *  - ordersCount: number (0 when none)
 *  - hasOrders: boolean
 *  - loading: boolean
 *  - error: string|null
 */
export default function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If the user is not authenticated there are definitely no orders.
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await db.getOrders(user.id);
        if (mounted) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error('Failed to fetch orders', e);
        if (mounted) {
          setOrders([]);
          setError(e.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      mounted = false;
    };
  }, [user]);

  return {
    orders,
    ordersCount: orders ? orders.length : 0,
    hasOrders: !!orders && orders.length > 0,
    loading,
    error
  };
}