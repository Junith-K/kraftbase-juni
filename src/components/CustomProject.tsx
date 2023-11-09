// CustomProject.tsx
import { useParams, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import EditTaskModal from "./EditTaskModal";
import { v4 as uuidv4 } from "uuid"; // Import uuid library for generating unique IDs
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
const CustomProject: React.FC = () => {
  const { projectId } = useParams();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const location = useLocation();
  const [projectName, setProjectName] = useState<string | null>(
    (location.state as any)?.projectName || null
  );
  const [tasks, setTasks] = useState<Tasks>({
    todo: [],
    inProgress: [],
    done: [],
  });

  const [selectedTaskDetails, setSelectedTaskDetails] = useState<{
    column: keyof Tasks;
    index: number;
    task?: Task;
  } | null>(null);

  const handleFilterByTag = (tag: string | null) => {
    setSelectedTag(tag);
  };

  // Add a useEffect to fetch tasks when the component mounts
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Retrieve the authentication token from localStorage
        const authToken = localStorage.getItem("token"); // Replace with the actual key used to store the token

        if (!authToken) {
          toast.error("Authentication token not found");
          throw new Error("Authentication token not found");
        }

        // Make API call to fetch all tasks
        const response = await fetch(
          `http://localhost:3001/api/projects/${projectId}/allTasks`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          toast.error("Failed to fetch tasks");

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
              // Assuming tasks have a 'priority' property
              sortedTasks[key as keyof Tasks] = data.tasks[key].sort(
                (a: Task, b: Task) => (b.priority ? 1 : -1)
              );
            } else {
              toast.error(`Invalid data format: tasks.${key} is not an array`);
              console.error(
                `Invalid data format: tasks.${key} is not an array`
              );
            }
          }

          setTasks(sortedTasks);
        } else {
          toast.error("Invalid data format: tasks is not an object");

          console.error("Invalid data format: tasks is not an object");
        }
      } catch (error) {
        toast.error("Error fetching tasks");

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
          toast.error("Authentication token not found");

          throw new Error("Authentication token not found");
        }
        // Make API call to update or add the task
        const response = await fetch(
          `http://localhost:3001/api/projects/${projectId}/addTask`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              column: updatedColumn,
              task: editedTask,
            }),
          }
        );

        if (!response.ok) {
          toast.error("Failed to save task");
          throw new Error("Failed to save task");
        }
        console.log(response);
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
        toast.success("Task saved successfully");
      } catch (error) {
        toast.error("Failed to save task");
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
          toast.error("Authentication token not found");
          throw new Error("Authentication token not found");
        }

        // Make API call to delete the task
        const response = await fetch(
          `http://localhost:3001/api/projects/${projectId}/deleteTask`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              column,
              taskId,
            }),
          }
        );

        if (!response.ok) {
          toast.error("Error deleting task");
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
        toast.success("Task deleted successfully");
      } catch (error) {
        toast.error("Error deleting task");
        console.error("Error deleting task:", error);
        // Handle error, e.g., show an error message to the user
      }
    }
  };

  return (
    <div className="flex flex-col justify-evenly h-screen items-center bg-gradient-to-r from-blue-200 to-green-200">
      <h1 className="text-3xl w-fit p-3 rounded-md font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 cursor-pointer">
        {projectName || "Project Name"}
      </h1>
      <div className="flex">
        <div className="flex flex-col items-center bg-blue-300 rounded-md p-4 mr-4 h-min">
          <h2 className="text-xl font-semibold mb-4 text-white underline">
            Tags
          </h2>
          <button
            className={`p-2 rounded cursor-pointer ${
              selectedTag === null && "bg-blue-500 text-white"
            } border-blue-100 border-2 hover:bg-blue-600 mb-2`}
            onClick={() => handleFilterByTag(null)}
          >
            All
          </button>
          {Array.from(
            new Set(
              tasks.todo
                .concat(tasks.inProgress, tasks.done)
                .map((task) => task.tag)
            )
          ).map((tag) => (
            <button
              key={tag}
              className={`p-2 rounded cursor-pointer ${
                selectedTag === tag && "bg-blue-500 text-white"
              } border-blue-100 border-2 hover:bg-blue-600 mb-2`}
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
            {tasks[column as keyof Tasks].length === 0 ? (
              <div className="mb-4 p-4 rounded cursor-pointer bg-gray-200">
                <p className="text-gray-600">No tasks available.</p>
              </div>
            ) : (
              tasks[column as keyof Tasks].map(
                (task, index) =>
                  (selectedTag === null || task.tag === selectedTag) && (
                    <div
                      key={index}
                      className={`mb-4 p-4 rounded cursor-pointer ${getTaskColor(
                        column
                      )}`}
                      style={{ width: "300px" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="overflow-hidden">
                          <strong className="break-words">{task.name}</strong>
                          <p className="break-words">{task.description}</p>
                          <div
                            className={`rounded-md p-1 w-fit mt-1 ${
                              task.priority
                                ? "bg-gradient-to-r from-red-500 to-yellow-500"
                                : "bg-gradient-to-r from-blue-500 to-green-500"
                            }`}
                          >
                            <p className="text-sm text-white whitespace-pre-line">
                              Tag: {task.tag}
                            </p>
                            <p className="text-sm text-white whitespace-pre-line">
                              Priority: {task.priority ? "High" : "Low"}
                            </p>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="whitespace-pre-line">
                            Due Date: {task.dueDate}
                          </p>
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
              )
            )}
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
      <ToastContainer />
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
export default CustomProject;
