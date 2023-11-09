import React, { useEffect, useState } from "react";
import EditTaskModal from "./EditTaskModal";
import { v4 as uuidv4 } from "uuid"; // Import uuid library for generating unique IDs
import { useNavigate } from "react-router-dom"; // Import useNavigate instead of useHistory

export interface Task {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  tag: string; // New tag property
  priority: boolean; // New priority property
}

export interface Tasks {
  todo: Task[];
  inProgress: Task[];
  done: Task[];
}

const KanbanBoard: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Tasks>({
    todo: [
      {
        id: "1",
        name: "Task 1",
        description: "Description 1",
        dueDate: "2023-12-31",
        tag: "Personal", // Example tag
        priority: false, // Example priority
      },
      {
        id: "2",
        name: "Task 2",
        description: "Description 2",
        dueDate: "2023-11-30",
        tag: "Work", // Example tag
        priority: true, // Example priority
      },
    ],
    inProgress: [
      {
        id: "3",
        name: "Task 3",
        description: "Description 3",
        dueDate: "2023-11-15",
        tag: "Personal", // Example tag
        priority: false, // Example priority
      },
    ],
    done: [
      {
        id: "4",
        name: "Task 4",
        description: "Description 4",
        dueDate: "2023-11-01",
        tag: "Work", // Example tag
        priority: true, // Example priority
      },
    ],
  });
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const [selectedTaskDetails, setSelectedTaskDetails] = useState<{
    column: keyof Tasks;
    index: number;
    task?: Task;
  } | null>(null);

  const handleFilterByTag = (tag: string | null) => {
    setSelectedTag(tag);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const authToken = localStorage.getItem("token");

        if (!authToken) {
          // If token doesn't exist, navigate back to /login
          navigate("/login");
          return;
        }

        // ... (rest of the code)

      } catch (error) {
        console.error("Error fetching tasks:", error);
        // Handle error, e.g., show an error message to the user
      }
    };

    fetchTasks();
  }, [navigate]);
  // Add a useEffect to fetch tasks when the component mounts
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Retrieve the authentication token from localStorage
        const authToken = localStorage.getItem("token"); // Replace with the actual key used to store the token
  
        if (!authToken) {
          throw new Error("Authentication token not found");
        }
  
        // Make API call to fetch all tasks
        const response = await fetch("http://localhost:3001/api/allTasks", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
  
        // Parse and set the tasks in the local state
        const data = await response.json();
  
        if (typeof data.tasks === "object") {
          const sortedTasks: Tasks = {
            todo: [],
            inProgress: [],
            done: [],
          };
  
          for (const key in data.tasks) {
            if (Array.isArray(data.tasks[key])) {
              sortedTasks[key as keyof Tasks] = data.tasks[key].sort((a:Task, b:Task) => (b.priority ? 1 : -1));
            } else {
              console.error(`Invalid data format: tasks.${key} is not an array`);
            }
          }
  
          setTasks(sortedTasks);
        } else {
          console.error("Invalid data format: tasks is not an object");
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        // Handle error, e.g., show an error message to the user
      }
    };
  
    fetchTasks();
  }, []);
  
  
  
   // Run this effect only once when the component mounts

  const handleAddTask = (column: keyof Tasks) => {
    const newTask: Task = {
      id: uuidv4(),
      name: "",
      description: "",
      dueDate: "",
      tag: "", // Default tag to be updated by the user
      priority: false, // Default priority to be updated by the user
    };
    setSelectedTaskDetails({
      column,
      index: tasks[column].length,
      task: newTask,
    });
  };
  const handleEditTask = (column: keyof Tasks, index: number) => {
    const task = tasks[column][index];
    setSelectedTaskDetails({ column, index, task });
  };

  const handleSaveTask = async (
    editedTask: Task,
    updatedColumn: keyof Tasks
  ) => {
    if (selectedTaskDetails !== null) {
      const { column, index } = selectedTaskDetails;

      try {
        // Retrieve the authentication token from localStorage
        const authToken = localStorage.getItem("token"); // Replace with the actual key used to store the token

        if (!authToken) {
          throw new Error("Authentication token not found");
        }

        // Make API call to update or add the task
        const response = await fetch("http://localhost:3001/api/addTask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            column: updatedColumn,
            task: editedTask,
          }),
        });

        if (!response.ok) {
          console.log(response);
          throw new Error("Failed to save task");
        }

        // Update the local state only if the API call is successful
        setTasks((prevTasks) => {
          const updatedTasks = { ...prevTasks };
  
          // Remove from the current column
          updatedTasks[column] = updatedTasks[column].filter(
            (task, i) => i !== index
          );
  
          // Add to the new column
          updatedTasks[updatedColumn] = [
            editedTask,
            ...updatedTasks[updatedColumn],
          ];
  
          // Sort the tasks based on priority (high priority first)
          updatedTasks[updatedColumn] = updatedTasks[updatedColumn].sort(
            (a, b) => (b.priority ? 1 : -1)
          );
  
          return updatedTasks;
        });

        setSelectedTaskDetails(null);
      } catch (error) {
        console.error("Error saving task:", error);
        // Handle error, e.g., show an error message to the user
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedTaskDetails(null);
  };

  const handleDeleteTask = async (
    column: keyof Tasks,
    taskId: string,
    index: number
  ) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );
  
    if (confirmDelete) {
      try {
        // Retrieve the authentication token from localStorage
        const authToken = localStorage.getItem("token"); // Replace with the actual key used to store the token
  
        if (!authToken) {
          throw new Error("Authentication token not found");
        }
  
        // Make API call to delete the task
        const response = await fetch("http://localhost:3001/api/deleteTask", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            column,
            taskId,
          }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to delete task");
        }
  
        // Update the local state only if the API call is successful
        setTasks((prevTasks) => {
          const updatedTasks = {
            ...prevTasks,
            [column]: prevTasks[column].filter((task, i) => i !== index),
          };
          return updatedTasks;
        });
      } catch (error) {
        console.error("Error deleting task:", error);
        // Handle error, e.g., show an error message to the user
      }
    }
  };
  

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-200 to-green-200">
      <div className="flex">
        <div className="flex flex-col items-center bg-blue-300 rounded-md p-4 mr-4 h-min">
          <h2 className="text-xl font-semibold mb-4 text-white underline">Tags</h2>
          <button
            className={`p-2 rounded cursor-pointer ${selectedTag === null && "bg-blue-500 text-white"} border-blue-100 border-2 hover:bg-blue-600 mb-2`}
            onClick={() => handleFilterByTag(null)}
          >
            All
          </button>
          {Array.from(new Set(tasks.todo.concat(tasks.inProgress, tasks.done).map(task => task.tag))).map(tag => (
            <button
              key={tag}
              className={`p-2 rounded cursor-pointer ${selectedTag === tag && "bg-blue-500 text-white"} border-blue-100 border-2 hover:bg-blue-600 mb-2`}
              onClick={() => handleFilterByTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        {Object.keys(tasks).map((column) => (
          <div
            key={column}
            className={`p-4 rounded shadow-md mr-4 max-w-md w-full bg-opacity-90 ${getBackgroundColor(
              column
            )}`}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center underline">
              {column === "todo"
                ? "ToDo"
                : column === "inProgress"
                ? "In Progress"
                : "Done"}
            </h2>
            {tasks[column as keyof Tasks].map((task, index) => (
              // Check if the task has the selected tag or show all tasks if no tag is selected
              (selectedTag === null || task.tag === selectedTag) && (
                <div
                  key={index}
                  className={`mb-4 p-4 rounded cursor-pointer ${getTaskColor(
                    column
                  )}`}
                  style={{ width: "300px" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>{task.name}</strong>
                      <p>{task.description}</p>
                      <div className={`rounded-md p-1 w-fit ${task.priority ? 'bg-gradient-to-r from-red-500 to-yellow-500' : 'bg-gradient-to-r from-blue-500 to-green-500'}`}>
                        <p className="text-sm text-white">Tag: {task.tag}</p>
                        <p className="text-sm text-white">Priority: {task.priority ? 'High' : 'Low'}</p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p>Due Date: {task.dueDate}</p>
                      <div className="flex space-x-2">
                        <button
                          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                          onClick={() =>
                            handleEditTask(column as keyof Tasks, index)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                          onClick={() =>
                            handleDeleteTask(
                              column as keyof Tasks,
                              task.id,
                              index
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        ))}
      </div>
      <button
        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 fixed bottom-4 right-4"
        onClick={() => handleAddTask("todo")}
      >
        Add Task
      </button>
      <EditTaskModal
        isOpen={selectedTaskDetails !== null}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        taskDetails={selectedTaskDetails}
      />
    </div>
  );
};

// Helper functions
const getBackgroundColor = (column: string): string => {
  switch (column) {
    case "todo":
      return "bg-blue-200";
    case "inProgress":
      return "bg-yellow-200";
    case "done":
      return "bg-green-200";
    default:
      return "";
  }
};

const getTaskColor = (column: string): string => {
  switch (column) {
    case "todo":
      return "bg-blue-100";
    case "inProgress":
      return "bg-yellow-100";
    case "done":
      return "bg-green-100";
    default:
      return "";
  }
};

export default KanbanBoard;
