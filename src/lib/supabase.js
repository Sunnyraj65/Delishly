import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
  },
  db: {
    schema: 'public'
  }
});

// Database helper functions with improved error handling
export const db = {
  // Categories
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Network error fetching categories:', error);
      // Return empty array as fallback
      return [];
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
        console.error('Error fetching products:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Network error fetching products:', error);
      // Return empty array as fallback
      return [];
    }
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
  },

  // Phone Authentication
  async createPhoneUser(phoneNumber, userData = {}) {
    try {
      // Create a phone-based email for Supabase compatibility
      const email = `${phoneNumber}@phone.freshcut.com`;
      const password = `phone_${phoneNumber}_${Date.now()}`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone: phoneNumber,
            auth_method: 'phone',
            name: userData.name || `User ${phoneNumber}`,
            ...userData
          }
        }
      });

      if (error) {
        console.error('Error creating phone user:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Network error creating phone user:', error);
      throw error;
    }
  },

  async signInWithPhone(phoneNumber, otp) {
    try {
      // For demo purposes, accept any 6-digit OTP
      if (!otp || otp.length !== 6) {
        throw new Error('Invalid OTP');
      }

      const email = `${phoneNumber}@phone.freshcut.com`;
      
      try {
        // Try to sign in with existing account
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: `phone_${phoneNumber}_verified`
        });

        if (error) {
          // If account doesn't exist, create it
          return await this.createPhoneUser(phoneNumber);
        }

        return data;
      } catch (err) {
        // Create new account if sign in fails
        return await this.createPhoneUser(phoneNumber);
      }
    } catch (error) {
      console.error('Network error signing in with phone:', error);
      throw error;
    }
  }
};

export default supabase;