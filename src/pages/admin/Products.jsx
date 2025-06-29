import React, { useEffect, useState } from "react";
import { db } from "lib/supabase";
import { useAuth } from "contexts/AuthContext";

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: "",
    target_weight: "",
    price_per_kg: "",
    category_id: "",
    grade: "",
    farm: "",
    status: "live"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        db.getProducts(),
        db.getCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (e) {
      setError(e.message);
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addProduct = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const targetWeight = parseFloat(form.target_weight);
      const pricePerKg = parseFloat(form.price_per_kg);
      
      const productData = {
        name: form.name,
        target_weight: targetWeight,
        actual_weight: targetWeight, // Default to target weight
        price_per_kg: pricePerKg,
        total_price: targetWeight * pricePerKg,
        category_id: form.category_id,
        grade: form.grade || null,
        farm: form.farm || null,
        status: form.status,
        images: [],
        stock_count: 1
      };

      await db.createProduct(productData);
      setForm({
        name: "",
        target_weight: "",
        price_per_kg: "",
        category_id: "",
        grade: "",
        farm: "",
        status: "live"
      });
      await fetchData();
    } catch (e) {
      setError(e.message);
      console.error('Error creating product:', e);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      setLoading(true);
      await db.deleteProduct(id);
      await fetchData();
    } catch (e) {
      setError(e.message);
      console.error('Error deleting product:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-error">Please sign in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-auto">
      <h1 className="text-2xl font-semibold mb-4">Products</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-error-50 border border-error-200 text-error-600 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={addProduct} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 items-end">
        <input 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          placeholder="Product Name" 
          className="border px-3 py-2 rounded" 
          required
        />
        <input 
          name="target_weight" 
          type="number" 
          step="0.1"
          value={form.target_weight} 
          onChange={handleChange} 
          placeholder="Weight (kg)" 
          className="border px-3 py-2 rounded" 
          required
        />
        <input 
          name="price_per_kg" 
          type="number" 
          step="0.01"
          value={form.price_per_kg} 
          onChange={handleChange} 
          placeholder="Price/kg" 
          className="border px-3 py-2 rounded" 
          required
        />
        <select 
          name="category_id" 
          value={form.category_id} 
          onChange={handleChange} 
          className="border px-3 py-2 rounded"
          required
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input 
          name="grade" 
          value={form.grade} 
          onChange={handleChange} 
          placeholder="Grade (optional)" 
          className="border px-3 py-2 rounded" 
        />
        <input 
          name="farm" 
          value={form.farm} 
          onChange={handleChange} 
          placeholder="Farm (optional)" 
          className="border px-3 py-2 rounded" 
        />
        <select 
          name="status" 
          value={form.status} 
          onChange={handleChange} 
          className="border px-3 py-2 rounded"
        >
          <option value="live">Live</option>
          <option value="draft">Draft</option>
        </select>
        <button 
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>

      {loading && products.length === 0 ? (
        <p>Loading products...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-3 border-b">Name</th>
                <th className="py-2 px-3 border-b">Weight</th>
                <th className="py-2 px-3 border-b">Price/kg</th>
                <th className="py-2 px-3 border-b">Total</th>
                <th className="py-2 px-3 border-b">Category</th>
                <th className="py-2 px-3 border-b">Status</th>
                <th className="py-2 px-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-2 px-3">{p.name}</td>
                  <td className="py-2 px-3">{p.target_weight}kg</td>
                  <td className="py-2 px-3">₹{p.price_per_kg}</td>
                  <td className="py-2 px-3">₹{p.total_price.toFixed(2)}</td>
                  <td className="py-2 px-3">{p.category?.name}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      p.status === 'live' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button 
                      onClick={() => deleteProduct(p.id)} 
                      disabled={loading}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Products;