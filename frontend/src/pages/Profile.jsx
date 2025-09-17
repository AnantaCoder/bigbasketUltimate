import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Pencil, Check, X } from 'lucide-react';
import { useSelector } from 'react-redux';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('editProfile');
  const user = useSelector((state) => state.auth.user);

  // State to track which field is being edited
  const [editingField, setEditingField] = useState(null);
  // Local state for editable fields
  const [name, setName] = useState(user?.name || user?.first_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  const startEditing = (field) => {
    setEditingField(field);
  };

  const cancelEditing = () => {
    setEditingField(null);
    // Reset fields to original user data on cancel
    setName(user?.name || user?.first_name || '');
    setPhone(user?.phone || '');
    setEmail(user?.email || '');
  };

  const saveField = (field) => {
    // For now, just stop editing. Backend update can be added later.
    setEditingField(null);
    // TODO: Add API call to save updated field
  };

  const renderEditableField = (label, fieldKey, value, setValue) => {
    return (
      <div className="border rounded p-4 flex justify-between items-center">
        <div>
          <span className="text-gray-600">{label}: </span>
          {editingField === fieldKey ? (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1"
            />
          ) : (
            <span className="font-bold">{value || 'N/A'}</span>
          )}
        </div>
        {editingField === fieldKey ? (
          <div className="flex space-x-2">
            <button
              aria-label={`Save ${label}`}
              onClick={() => saveField(fieldKey)}
              className="text-green-600"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              aria-label={`Cancel ${label}`}
              onClick={cancelEditing}
              className="text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button aria-label={`Edit ${label}`} onClick={() => startEditing(fieldKey)}>
            <Pencil className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'editProfile':
        return (
          <div className="max-w-xl space-y-6">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            {renderEditableField('Name', 'name', name, setName)}
            {renderEditableField('Mobile Number', 'phone', phone, setPhone)}
            {renderEditableField('Email', 'email', email, setEmail)}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="promotions"
                defaultChecked
                className="w-4 h-4 text-green-600 border-gray-300 rounded"
              />
              <label htmlFor="promotions" className="text-gray-700">
                Send me mails on promotions, offers and services
              </label>
            </div>
          </div>
        );
      case 'deliveryAddresses':
        return <div><h2 className="text-xl font-semibold">Delivery Addresses</h2><p>Coming soon...</p></div>;
      case 'emailAddresses':
        return <div><h2 className="text-xl font-semibold">Email Addresses</h2><p>Coming soon...</p></div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">PERSONAL DETAILS</h1>
        <nav className="mb-6 border-b border-gray-300">
          <ul className="flex space-x-8 text-gray-600 font-semibold">
            <li>
              <button
                className={`pb-2 ${activeTab === 'editProfile' ? 'border-b-4 border-green-600 text-gray-900' : ''}`}
                onClick={() => setActiveTab('editProfile')}
              >
                Edit Profile
              </button>
            </li>
            <li>
              <button
                className={`pb-2 ${activeTab === 'deliveryAddresses' ? 'border-b-4 border-green-600 text-gray-900' : ''}`}
                onClick={() => setActiveTab('deliveryAddresses')}
              >
                Delivery Addresses
              </button>
            </li>
            <li>
              <button
                className={`pb-2 ${activeTab === 'emailAddresses' ? 'border-b-4 border-green-600 text-gray-900' : ''}`}
                onClick={() => setActiveTab('emailAddresses')}
              >
                Email Addresses
              </button>
            </li>
          </ul>
        </nav>
        {renderContent()}
      </div>
    </div>
  );
};

export default Profile;