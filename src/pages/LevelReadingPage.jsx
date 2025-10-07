import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SQLChatbot from "../components/SQLChatbot";
import LogoutButton from "../components/auth/LogoutButton";

export default function LevelReadingPage() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const [iframeError, setIframeError] = useState(false);
  const htmlFile = `/document/level${levelId}.html`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4 py-8">
      <div className="fixed top-4 right-4 z-50">
        <LogoutButton />
      </div>
      <h1 className="text-4xl font-extrabold mb-4">Level {levelId} Preparation</h1>
      <p className="mb-6 text-lg max-w-xl text-center">
        Please read the instructions and information below before starting Level {levelId}. This will help you understand the challenge and succeed in the game!
      </p>
      <div className="w-full max-w-2xl mb-8 bg-white rounded-lg shadow-lg overflow-hidden">
        {iframeError ? (
          <div className="p-8 text-center text-red-600 font-bold">
            Document not found. Please check that <br />
            <code>public/document/level{levelId}.html</code> exists and is accessible.
          </div>
        ) : (
          <iframe
            src={htmlFile}
            title={`Level ${levelId} Content`}
            className="w-full h-96 border-none"
            onError={() => setIframeError(true)}
          />
        )}
      </div>
      <button
        className="px-8 py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-xl text-xl font-bold hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 transition shadow-lg"
        onClick={() => navigate(`/level/${levelId}`)}
      >
        Play Now - Level {levelId}
      </button>
      
      <SQLChatbot />
    </div>
  );
}