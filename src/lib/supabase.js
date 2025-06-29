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
  }
});

// Database helper functions
export const db = {
  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async createCategory(name) {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCategory(id, name) {
    const { data, error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteCategory(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Products
  async getProducts(filters = {}) {
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
    
    if (error) throw error;
    return data;
  },

  async createProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select(`
        *,
        category:categories(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProduct(id, productData) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select(`
        *,
        category:categories(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Orders
  async getOrders(userId = null) {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('customer_id', userId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  async createOrder(orderData) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        ...orderData,
        customer_id: user?.id
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getOrder(id) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Phone Authentication
  async createPhoneUser(phoneNumber, userData = {}) {
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

    if (error) throw error;
    return data;
  },

  async signInWithPhone(phoneNumber, otp) {
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
  }
};

export default supabase;