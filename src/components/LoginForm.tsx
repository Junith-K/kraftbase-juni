// src/components/LoginForm.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const authToken = localStorage.getItem("token");

        if (authToken) {
          navigate("/");
          return;
        }
      } catch (error) {
        toast.error("Error fetching token");
        console.error("Error fetching token:", error);
      }
    };

    fetchTasks();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      // Send a POST request to your backend API for user login
      const response = await fetch('https://kraftbase-backend-juni.onrender.com/api/login', {
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
        const errorResult = await response.json();
        toast.error('Login error:'+ errorResult.error);
        console.error('Login error:', errorResult.error);
  
        // Handle the error message as needed (e.g., display it to the user)
      }
    } catch (error) {
        toast.error('Error during login');
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
      <ToastContainer />
    </div>
  );
};

export default LoginForm;
