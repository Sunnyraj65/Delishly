import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Config Check:');
console.log('URL:', supabaseUrl);
console.log('Key present:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  throw new Error('Supabase configuration missing');
}

// ✅ Ensure NO trailing slash in URL
const cleanUrl = supabaseUrl.replace(/\/$/, '');

export const supabase = createClient(cleanUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  }
});

// Test connection function
export const testConnection = async () => {
  try {
    console.log('🔄 Testing Supabase connection...');
    const { data, error } = await supabase.from('categories').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('❌ Network error testing connection:', err);
    return false;
  }
};

// Database helper functions with improved error handling and fallback data
export const db = {
  // Categories
  async getCategories() {
    try {
      console.log('📡 Fetching categories from Supabase...');
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('❌ Supabase error fetching categories:', error);
        throw error;
      }
      
      console.log('✅ Categories fetched successfully:', data?.length || 0, 'items');
      return data || [];
    } catch (error) {
      console.error('❌ Network error fetching categories:', error);
      console.log('🔄 Using fallback data...');
      
      // Return fallback data
      return [
        { id: '1', name: 'Chicken', created_at: new Date().toISOString() },
        { id: '2', name: 'Fish', created_at: new Date().toISOString() }
      ];
    }
  },

  async createCategory(name) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating category:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Network error creating category:', error);
      throw error;
    }
  },

  async updateCategory(id, name) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating category:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Network error updating category:', error);
      throw error;
    }
  },

  async deleteCategory(id) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting category:', error);
        throw error;
      }
    } catch (error) {
      console.error('Network error deleting category:', error);
      throw error;
    }
  },

  // Products
  async getProducts(filters = {}) {
    try {
      console.log('📡 Fetching products from Supabase with filters:', filters);
      
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Supabase error fetching products:', error);
        throw error;
      }
      
      console.log('✅ Products fetched successfully:', data?.length || 0, 'items');
      return data || [];
    } catch (error) {
      console.error('❌ Network error fetching products:', error);
      console.log('🔄 Falling back to mock data...');
      
      // Return fallback mock data for development
      return this.getMockProducts(filters);
    }
  },

  // Mock data for fallback when Supabase is not available
  getMockProducts(filters = {}) {
    console.log('🎭 Using mock product data as fallback');
    
    const mockCategories = {
      '1': { id: '1', name: 'Chicken' },
      '2': { id: '2', name: 'Fish' }
    };

    const mockProducts = [
      {
        id: '1',
        name: 'Farm Fresh Chicken',
        target_weight: 1.2,
        actual_weight: 1.18,
        price_per_kg: 180,
        total_price: 212.40,
        images: ['https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400'],
        grade: 'Premium',
        farm: 'Farm A',
        status: 'live',
        stock_count: 15,
        category_id: '1',
        category: mockCategories['1'],
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Organic Chicken',
        target_weight: 1.4,
        actual_weight: 1.42,
        price_per_kg: 200,
        total_price: 284.00,
        images: ['https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400'],
        grade: 'Grade A',
        farm: 'Farm B',
        status: 'live',
        stock_count: 8,
        category_id: '1',
        category: mockCategories['1'],
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Free Range Chicken',
        target_weight: 1.6,
        actual_weight: 1.58,
        price_per_kg: 180,
        total_price: 284.40,
        images: ['https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400'],
        grade: 'Premium',
        farm: 'Farm C',
        status: 'live',
        stock_count: 12,
        category_id: '1',
        category: mockCategories['1'],
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Fresh Pomfret',
        target_weight: 1.2,
        actual_weight: 1.15,
        price_per_kg: 299,
        total_price: 344.85,
        images: ['https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=400'],
        grade: 'Premium',
        farm: 'Coastal Farm A',
        status: 'live',
        stock_count: 6,
        category_id: '2',
        category: mockCategories['2'],
        created_at: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Sea Bass',
        target_weight: 1.4,
        actual_weight: 1.38,
        price_per_kg: 350,
        total_price: 483.00,
        images: ['https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=400'],
        grade: 'Grade A',
        farm: 'Coastal Farm B',
        status: 'live',
        stock_count: 10,
        category_id: '2',
        category: mockCategories['2'],
        created_at: new Date().toISOString()
      },
      {
        id: '6',
        name: 'Fresh Kingfish',
        target_weight: 1.6,
        actual_weight: 1.62,
        price_per_kg: 299,
        total_price: 484.38,
        images: ['https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=400'],
        grade: 'Premium',
        farm: 'Coastal Farm C',
        status: 'live',
        stock_count: 14,
        category_id: '2',
        category: mockCategories['2'],
        created_at: new Date().toISOString()
      }
    ];

    // Apply filters
    let filteredProducts = mockProducts;

    if (filters.status) {
      filteredProducts = filteredProducts.filter(p => p.status === filters.status);
    }

    if (filters.categoryId) {
      filteredProducts = filteredProducts.filter(p => p.category_id === filters.categoryId);
    }

    if (filters.search) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    return filteredProducts;
  },

  async createProduct(productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select(`
          *,
          category:categories(*)
        `)
        .single();
      
      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Network error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id, productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select(`
          *,
          category:categories(*)
        `)
        .single();
      
      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Network error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
    } catch (error) {
      console.error('Network error deleting product:', error);
      throw error;
    }
  },

  // Orders
  async getOrders(userId = null) {
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('customer_id', userId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Network error fetching orders:', error);
      // Return empty array as fallback
      return [];
    }
  },

  async createOrder(orderData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          ...orderData,
          customer_id: user?.id
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Network error creating order:', error);
      throw error;
    }
  },

  async getOrder(id) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching order:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Network error fetching order:', error);
      throw error;
    }
  }
};

// Test connection on module load
testConnection();

export default supabase;