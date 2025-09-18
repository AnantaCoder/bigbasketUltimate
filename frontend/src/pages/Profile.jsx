import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Breadcrumb from "../components/Breadcrumb";
import { Pencil, Check, X, Plus, Trash2, MapPin } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import api from "../services/api";
import { updateUser } from "../app/slices/authSlice";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("editProfile");
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  // State to track which field is being edited
  const [editingField, setEditingField] = useState(null);
  // Local state for editable fields
  const [name, setName] = useState(user?.name || user?.first_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    phone_no: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false,
  });

  // Loading states
  const loading = useSelector((state) => state.auth.loading);

  useEffect(() => {
    if (activeTab === "deliveryAddresses") {
      fetchAddresses();
    }
  }, [activeTab]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const response = await api.get("/store/order-users/");
      setAddresses(response.data.results || []);
    } catch {
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const startEditing = (field) => {
    setEditingField(field);
  };

  const cancelEditing = () => {
    setEditingField(null);
    // Reset fields to original user data on cancel
    setName(user?.name || user?.first_name || "");
    setPhone(user?.phone || "");
    setEmail(user?.email || "");
  };

  const saveField = async (field) => {
    const data = {};
    if (field === "name") data.first_name = name;
    if (field === "phone") data.phone = phone;
    if (field === "email") data.email = email;

    await updateProfile(data);
  };

  const updateProfile = async (data) => {
    try {
      await dispatch(updateUser(data)).unwrap();
      setEditingField(null);
      alert("Profile updated successfully!");
    } catch {
      alert("Failed to update profile. Please try again.");
    }
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
            <span className="font-bold">{value || "N/A"}</span>
          )}
        </div>
        {editingField === fieldKey ? (
          <div className="flex space-x-2">
            <button
              aria-label={`Save ${label}`}
              onClick={() => saveField(fieldKey)}
              disabled={loading}
              className="text-green-600 disabled:opacity-50"
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
          <button
            aria-label={`Edit ${label}`}
            onClick={() => startEditing(fieldKey)}
          >
            <Pencil className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>
    );
  };

  const validateAddress = (addr) => {
    const errors = [];
    if (!addr.phone_no || !/^\d{10,15}$/.test(addr.phone_no)) {
      errors.push("Phone number must be 10-15 digits.");
    }
    if (!addr.address.trim()) {
      errors.push("Address is required.");
    }
    if (!addr.city.trim()) {
      errors.push("City is required.");
    }
    if (!addr.state.trim()) {
      errors.push("State is required.");
    }
    if (!addr.pincode || !/^\d{6}$/.test(addr.pincode)) {
      errors.push("Pincode must be 6 digits.");
    }
    return errors;
  };

  const handleAddAddress = async () => {
    const errors = validateAddress(newAddress);
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }
    try {
      await api.post("/store/order-users/", newAddress);
      setNewAddress({
        phone_no: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        is_default: false,
      });
      fetchAddresses();
      alert("Address added successfully!");
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to add address. Please try again.";
      alert(message);
    }
  };

  const handleEditAddress = async (id, updatedAddress) => {
    try {
      await api.patch(`/store/order-users/${id}/`, updatedAddress);
      setEditingAddress(null);
      fetchAddresses();
      alert("Address updated successfully!");
    } catch {
      alert("Failed to update address. Please try again.");
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await api.delete(`/store/order-users/${id}/`);
        fetchAddresses();
        alert("Address deleted successfully!");
      } catch {
        alert("Failed to delete address. Please try again.");
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "editProfile":
        return (
          <div className="max-w-xl space-y-6">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            {renderEditableField("Name", "name", name, setName)}
            {renderEditableField("Mobile Number", "phone", phone, setPhone)}
            {renderEditableField("Email", "email", email, setEmail)}
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
      case "deliveryAddresses":
        return (
          <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Delivery Addresses</h2>
              <button
                onClick={() => setEditingAddress("new")}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Address</span>
              </button>
            </div>
            {loadingAddresses ? (
              <p>Loading addresses...</p>
            ) : (
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="border rounded p-4">
                    {editingAddress === addr.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Phone"
                          value={
                            editingAddress === addr.id ? addr.phone_no : ""
                          }
                          onChange={(e) => {
                            const updated = {
                              ...addr,
                              phone_no: e.target.value,
                            };
                            setAddresses(
                              addresses.map((a) =>
                                a.id === addr.id ? updated : a
                              )
                            );
                          }}
                          className="w-full p-2 border rounded"
                        />
                        <textarea
                          placeholder="Address"
                          value={editingAddress === addr.id ? addr.address : ""}
                          onChange={(e) => {
                            const updated = {
                              ...addr,
                              address: e.target.value,
                            };
                            setAddresses(
                              addresses.map((a) =>
                                a.id === addr.id ? updated : a
                              )
                            );
                          }}
                          className="w-full p-2 border rounded"
                        />
                        <input
                          type="text"
                          placeholder="City"
                          value={editingAddress === addr.id ? addr.city : ""}
                          onChange={(e) => {
                            const updated = { ...addr, city: e.target.value };
                            setAddresses(
                              addresses.map((a) =>
                                a.id === addr.id ? updated : a
                              )
                            );
                          }}
                          className="w-full p-2 border rounded"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={editingAddress === addr.id ? addr.state : ""}
                          onChange={(e) => {
                            const updated = { ...addr, state: e.target.value };
                            setAddresses(
                              addresses.map((a) =>
                                a.id === addr.id ? updated : a
                              )
                            );
                          }}
                          className="w-full p-2 border rounded"
                        />
                        <input
                          type="text"
                          placeholder="Pincode"
                          value={editingAddress === addr.id ? addr.pincode : ""}
                          onChange={(e) => {
                            const updated = {
                              ...addr,
                              pincode: e.target.value,
                            };
                            setAddresses(
                              addresses.map((a) =>
                                a.id === addr.id ? updated : a
                              )
                            );
                          }}
                          className="w-full p-2 border rounded"
                        />
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={
                              editingAddress === addr.id
                                ? addr.is_default
                                : false
                            }
                            onChange={(e) => {
                              const updated = {
                                ...addr,
                                is_default: e.target.checked,
                              };
                              setAddresses(
                                addresses.map((a) =>
                                  a.id === addr.id ? updated : a
                                )
                              );
                            }}
                          />
                          <span>Set as default</span>
                        </label>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditAddress(addr.id, addr)}
                            className="bg-green-600 text-white px-4 py-2 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingAddress(null)}
                            className="bg-gray-600 text-white px-4 py-2 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{addr.phone_no}</p>
                          <p>{addr.address}</p>
                          <p>
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          {addr.is_default && (
                            <span className="text-green-600 font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingAddress(addr.id)}
                            className="text-blue-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {editingAddress === "new" && (
                  <div className="border rounded p-4 space-y-2">
                    <input
                      type="text"
                      placeholder="Phone"
                      value={newAddress.phone_no}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          phone_no: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                    />
                    <textarea
                      placeholder="Address"
                      value={newAddress.address}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          address: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, state: e.target.value })
                      }
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={newAddress.pincode}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          pincode: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newAddress.is_default}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            is_default: e.target.checked,
                          })
                        }
                      />
                      <span>Set as default</span>
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddAddress}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setEditingAddress(null)}
                        className="bg-gray-600 text-white px-4 py-2 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case "emailAddresses":
        return (
          <div className="max-w-xl space-y-6">
            <h2 className="text-xl font-semibold mb-4">Email Addresses</h2>
            <div className="border rounded p-4">
              <p className="text-gray-600">
                Current Email: <span className="font-bold">{user?.email}</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                To change your email address, edit it in the Edit Profile tab.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <Breadcrumb />
        <h1 className="text-2xl font-bold mb-6">PERSONAL DETAILS</h1>
        <nav className="mb-6 border-b border-gray-300">
          <ul className="flex space-x-8 text-gray-600 font-semibold">
            <li>
              <button
                className={`pb-2 ${
                  activeTab === "editProfile"
                    ? "border-b-4 border-green-600 text-gray-900"
                    : ""
                }`}
                onClick={() => setActiveTab("editProfile")}
              >
                Edit Profile
              </button>
            </li>
            <li>
              <button
                className={`pb-2 ${
                  activeTab === "deliveryAddresses"
                    ? "border-b-4 border-green-600 text-gray-900"
                    : ""
                }`}
                onClick={() => setActiveTab("deliveryAddresses")}
              >
                Delivery Addresses
              </button>
            </li>
            <li>
              <button
                className={`pb-2 ${
                  activeTab === "emailAddresses"
                    ? "border-b-4 border-green-600 text-gray-900"
                    : ""
                }`}
                onClick={() => setActiveTab("emailAddresses")}
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
