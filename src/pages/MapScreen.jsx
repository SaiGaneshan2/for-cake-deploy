import React, { useState } from 'react';
import MapMainView from '../components/MapMainView';
import SQLChatbot from '../components/SQLChatbot';
import UserProfile from '../components/UserProfile';
import LogoutButton from '../components/auth/LogoutButton';

function MapScreen() {

  return (
    <>
      {/* User Profile Header */}
      <div className="fixed top-4 left-4 z-50 flex items-center space-x-3">
        <UserProfile />
        <LogoutButton />
      </div>
      
      <MapMainView />
      <SQLChatbot />
    </>
  );
}

export default MapScreen;
