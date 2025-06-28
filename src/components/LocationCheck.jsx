import React, { useState, useEffect } from 'react';

/**
 * Modal to capture user's pincode + address and validate serviceability.
 * Props:
 *  - onSuccess({ pincode, address }): called when serviceable location confirmed.
 */
export default function LocationCheck({ onSuccess }) {
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState(null); // null | 'success' | 'fail'
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY; // add this in .env

  const checkService = async () => {
    if (!/^\d{6}$/.test(pincode)) {
      alert('Enter a valid 6-digit pincode');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/pincode/check/${pincode}`);
      const data = await res.json();
      if (data.serviceable) {
        setStatus('success');
        const loc = { pincode, address };
        localStorage.setItem('userLocation', JSON.stringify(loc));
        onSuccess(loc);
      } else {
        setStatus('fail');
      }
    } catch (e) {
      console.error('Failed to check pincode', e);
      setStatus('fail');
    }
    setLoading(false);
  };

  // fetch address suggestions when address input changes
  useEffect(() => {
    if (!GOOGLE_KEY || address.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          address
        )}&key=${GOOGLE_KEY}&types=address&components=country:in`,
        { signal: controller.signal }
      )
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d.predictions)) setSuggestions(d.predictions);
        })
        .catch(() => {});
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [address, GOOGLE_KEY]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-lg p-6 animate-fade-in">
        <h2 className="text-lg font-heading font-semibold mb-4 text-center">Enter Your Delivery Location</h2>

        <input
          type="text"
          placeholder="Pincode"
          className="w-full mb-3 p-2 border rounded"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          maxLength={6}
        />

        <input
          type="text"
          placeholder="Full Address"
          className="w-full mb-2 p-2 border rounded"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        {suggestions.length > 0 && (
          <ul className="border border-border rounded mb-3 max-h-40 overflow-y-auto bg-white shadow-sm">
            {suggestions.map((s) => (
              <li
                key={s.place_id}
                className="px-3 py-2 text-sm hover:bg-primary-50 cursor-pointer"
                onClick={() => {
                  setAddress(s.description);
                  setSuggestions([]);
                }}
              >
                {s.description}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={checkService}
          disabled={loading}
          className="bg-primary text-white w-full py-2 rounded disabled:opacity-60"
        >
          {loading ? 'Checking…' : 'Check Availability'}
        </button>

        {status === 'success' && (
          <p className="text-green-600 mt-3 text-center">✅ We deliver to your area!</p>
        )}
        {status === 'fail' && (
          <p className="text-red-600 mt-3 text-center">❌ Sorry, we do not serve this area yet.</p>
        )}
      </div>
    </div>
  );
}
