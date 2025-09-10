import React from 'react';
import Sidebar from '../components/Sidebar';

const Profile = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <p>Edit your profile information here.</p>
        {/* Add profile edit form here */}
      </div>
    </div>
  );
};

export default Profile;
