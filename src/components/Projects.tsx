// Projects.tsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Task {
    id: string;
    name: string;
    description: string;
    dueDate: string;
    tag: string;
    priority: boolean;
}
  
interface Project {
    id: string;
    name: string;
    tasks: Task[]; 
}

// Set app element for the modal
Modal.setAppElement('#root');

const Projects: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setProjectName('');
  };

  const handleProjectSubmit = async () => {
    try {
      if (projectName.trim() !== '') {
        const response = await fetch('http://localhost:3001/api/createProject', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            id: uuidv4(),
            name: projectName,
            tasks: [], // Add an empty tasks array
          }),
        });
  
        if (!response.ok) {
            toast.error("Failed to create project");

          throw new Error('Failed to create project');
        }
  
        // Parse the response if needed
        const data = await response.json();
        console.log(data)
        // Update the local state only if the API call is successful
        setProjects((prevProjects) => [
          ...prevProjects,
          {
            id: uuidv4(),
            name: projectName,
            tasks: [],
          },
        ]);
        
        closeModal();
        toast.success("Project created successfully");
      }
    } catch (error) {
        toast.error("Failed to create project");
      console.error('Error creating project:', error);
      // Handle error, e.g., show an error message to the user
    }
  };
  

  const handleProjectClick = (projectId: string, projectName: string) => {
    // Navigate to the custom project page with additional data
    navigate(`/projects/${projectId}`, { state: { projectName } });
  };
  

  useEffect(() => {
    // Fetch the project names and ids from the API
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/projects/names', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
            toast.error("Failed to fetch project");
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        setProjects(data.projectsNames);
      } catch (error) {
        toast.error("Failed to fetch project");
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const authToken = localStorage.getItem("token");

        if (!authToken) {
          navigate("/login");
          return;
        }
      } catch (error) {
        toast.error("Failed to fetch token");
        console.error("Error fetching token:", error);
      }
    };

    fetchTasks();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center h-screen pt-8 bg-gradient-to-r from-blue-200 to-green-200">
      <button
        onClick={openModal}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Create New Project
      </button>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Enter Project Name"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>Enter Project Name</h2>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <button
          onClick={handleProjectSubmit}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </Modal>

      {/* Display Projects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="max-w-md mx-auto bg-blue-200 p-4 rounded-md shadow-md cursor-pointer"
            onClick={() => handleProjectClick(project.id,project.name)}
          >
            <h2 className="text-xl font-semibold">{project.name}</h2>
          </div>
        ))}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Projects;
