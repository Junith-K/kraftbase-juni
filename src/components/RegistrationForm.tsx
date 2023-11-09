// src/components/RegistrationForm.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
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
        console.error("Error fetching token:", error);
      }
    };

    fetchTasks();
  }, [navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      // Send a POST request to your backend API for user registration
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        // Registration successful
        const result = await response.json();
  
        // Check if the response includes a token
        if (result.token) {
          console.log(result.token); // Log the JWT token
  
          // Save the token to localStorage (or secure storage) for authentication
          localStorage.setItem('token', result.token);
  
          // Redirect to a protected route or the home page
          navigate('/');
        } else {
          console.log(result.message); // Log the success message without a token
          // Redirect to a protected route or the home page
          navigate('/');
        }
      } else {
        // Registration failed
        const errorResult = await response.json();
        console.error('Registration error:', errorResult.error);
  
        // Handle the error message as needed (e.g., display it to the user)
      }
    } catch (error) {
      console.error('Error during registration:', error);
      // Handle other errors (e.g., network issues)
    }
  };
  

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-200 to-green-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md max-w-xl w-full bg-opacity-90"
      >
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Register
        </h2>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-800">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>
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
          Register
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
