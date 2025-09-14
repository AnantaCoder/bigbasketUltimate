import React, { useState } from 'react';

const SellerProfileForm = ({ profile, onUpdate }) => {
  const [formData, setFormData] = useState({
    shop_name: profile.shop_name || '',
    gst_number: profile.gst_number || '',
    address: profile.address || '',
    seller_type: profile.seller_type || 'individual',
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      shop_name: profile.shop_name || '',
      gst_number: profile.gst_number || '',
      address: profile.address || '',
      seller_type: profile.seller_type || 'individual',
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Seller Profile</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop Name
            </label>
            <input
              type="text"
              name="shop_name"
              value={formData.shop_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GST Number
            </label>
            <input
              type="text"
              name="gst_number"
              value={formData.gst_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seller Type
            </label>
            <select
              name="seller_type"
              value={formData.seller_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="individual">Individual</option>
              <option value="wholesaler">Wholesaler</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-700">Shop Name:</span>
              <p className="text-gray-900">{profile.shop_name || 'Not set'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">GST Number:</span>
              <p className="text-gray-900">{profile.gst_number || 'Not set'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Seller Type:</span>
              <p className="text-gray-900">{profile.seller_type || 'Not set'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Verified:</span>
              <p className="text-gray-900">{profile.is_verified ? 'Yes' : 'No'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700">Address:</span>
              <p className="text-gray-900">{profile.address || 'Not set'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created At:</span>
              <p className="text-gray-900">{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Not available'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Last Updated:</span>
              <p className="text-gray-900">{profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Not available'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProfileForm;
