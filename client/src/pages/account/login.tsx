import React from "react";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Login Page</h1>
        <p className="text-center mb-4">This is a basic login page</p>
        <div className="flex justify-center">
          <button 
            onClick={() => console.log('Login clicked')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}