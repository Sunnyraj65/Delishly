import React, { useEffect, useState } from "react";
import { db } from "lib/supabase";
import { useAuth } from "contexts/AuthContext";

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await db.getCategories();
      setCategories(data);
    } catch (e) {
      setError(e.message);
      console.error('Error fetching categories:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    try {
      setLoading(true);
      await db.createCategory(name);
      setName("");
      await fetchCategories();
    } catch (e) {
      setError(e.message);
      console.error('Error creating category:', e);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      setLoading(true);
      await db.deleteCategory(id);
      await fetchCategories();
    } catch (e) {
      setError(e.message);
      console.error('Error deleting category:', e);
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
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Categories</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-error-50 border border-error-200 text-error-600 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={addCategory} className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-3 py-2 rounded w-60"
          placeholder="New category name"
          disabled={loading}
        />
        <button 
          type="submit"
          disabled={loading || !name.trim()}
          className="bg-green-600 text-white px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>
      
      {loading && categories.length === 0 ? (
        <p>Loading categories...</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-3 border-b">ID</th>
              <th className="py-2 px-3 border-b">Name</th>
              <th className="py-2 px-3 border-b">Created</th>
              <th className="py-2 px-3 border-b"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="py-2 px-3 font-mono text-xs">{c.id}</td>
                <td className="py-2 px-3">{c.name}</td>
                <td className="py-2 px-3 text-sm text-gray-500">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
                <td className="py-2 px-3 text-right">
                  <button
                    onClick={() => deleteCategory(c.id)}
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
      )}
    </div>
  );
};

export default Categories;