// src/components/LoginForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      // Send a POST request to your backend API for user login
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        // Login successful
        const result = await response.json();
        console.log(result.token); // Log the JWT token
  
        // Save the token to localStorage (or secure storage) for authentication
        localStorage.setItem('token', result.token);
  
        // Redirect to a protected route or the home page
        navigate('/');
      } else {
        // Login failed
        const errorResult = await response.json();
        console.error('Login error:', errorResult.error);
  
        // Handle the error message as needed (e.g., display it to the user)
      }
    } catch (error) {
      console.error('Error during login:', error);
      // Handle other errors (e.g., network issues)
    }
  };
  

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-200 to-green-200">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md max-w-xl w-full bg-opacity-90"
      >
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Login</h2>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-800">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-800">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
