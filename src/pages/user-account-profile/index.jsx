import React, { useEffect, useState } from 'react';
import SidebarMenu from './components/SidebarMenu';
import InfoCard from './components/InfoCard';
import { Link } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { db } from 'lib/supabase';

const menuItems = [
  { key: 'info', label: 'My Orders', icon: 'Package' },
  { key: 'wishlist', label: 'Wishlist', icon: 'Heart' },
  { key: 'list', label: 'My List', icon: 'List' },
  { key: 'coupons', label: 'Coupons', icon: 'CreditCard' },
  { key: 'addresses', label: 'Delivery Addresses', icon: 'MapPin' },
];

const UserAccountProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const data = await db.getOrders(user.id);
        setOrders(data);
      } catch (e) {
        console.error('Error fetching orders:', e);
      }
      setLoading(false);
    };
    
    fetchOrders();
  }, [user]);

  if (!user) return null;

  // Transform user data to match the expected format
  const userData = {
    fullName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    primaryEmailAddress: { emailAddress: user.email },
    primaryPhoneNumber: { phoneNumber: user.user_metadata?.phone || '' },
    imageUrl: user.user_metadata?.avatar_url || null,
    publicMetadata: {
      defaultAddress: user.user_metadata?.address || ''
    }
  };

  return (
    <div className="min-h-screen bg-surface p-6 flex flex-col gap-6">
      <div>
        <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <SidebarMenu
          user={userData}
          items={menuItems}
          active={activeTab}
          onChange={setActiveTab}
        />

        {/* Content panel */}
        <div className="flex-1 max-w-2xl">
          {activeTab === 'info' && <InfoCard user={userData} onEdit={() => {}} />}
          {activeTab === 'info' && (
            <div className="mt-8">
              <h2 className="text-xl font-heading font-bold mb-4 text-text-primary">My Orders</h2>
              {loading ? (
                <p className="text-text-secondary">Loading...</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-text-secondary mb-4">You have no orders yet.</p>
                  <Link 
                    to="/product-selection"
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-smooth"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {orders.map((o) => (
                    <li key={o.id} className="p-4 border rounded shadow-sm bg-white">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Order #{o.id.slice(0, 8)}</span>
                        <span className="text-sm text-gray-500">{new Date(o.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm mt-1">Status: {o.status}</p>
                      <p className="text-sm">Total: ₹{o.total.toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {/* Other tabs placeholder */}
          {activeTab !== 'info' && (
            <div className="p-6 bg-white border border-border rounded-lg text-text-secondary">
              Feature coming soon.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAccountProfile;