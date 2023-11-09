import React, { useState, useEffect } from "react";
import { Tasks, Task } from "./KanbanBoard";
import { v4 as uuidv4 } from 'uuid'; // Import uuid library for generating unique IDs

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedTask: Task, updatedColumn: keyof Tasks) => void;
  taskDetails: { column: keyof Tasks; index: number; task?: Task } | null;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskDetails,
}) => {
  const [editedTask, setEditedTask] = useState<Task>({
    id: "",
    name: "",
    description: "",
    dueDate: "",
    tag: "", // New tag property
    priority: false, // New priority property
  });
  const [updatedColumn, setUpdatedColumn] = useState<keyof Tasks>("todo");
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  useEffect(() => {
    // Update modal content based on taskDetails
    if (taskDetails !== null) {
      const { column, index, task } = taskDetails;
      setEditedTask(task ? { ...task } : { id: "", name: "", description: "", dueDate: "", tag: "", priority: false });
      setUpdatedColumn(column);
    }
  }, [taskDetails]);

  useEffect(() => {
    // Check if the form is valid
    setIsFormValid(
      editedTask.name.trim() !== "" &&
        editedTask.description.trim() !== "" &&
        editedTask.dueDate !== "" &&
        editedTask.tag.trim() !== "" // Check if tag is not empty
    );
  }, [editedTask]);

  useEffect(() => {
    // Handle validation when the modal is opened for editing
    setIsFormValid(
      editedTask.name.trim() !== "" &&
        editedTask.description.trim() !== "" &&
        editedTask.dueDate !== "" &&
        editedTask.tag.trim() !== ""
    );
  }, [isOpen]);

  const handleSave = () => {
    const taskWithId = { ...editedTask, id: taskDetails?.task?.id || uuidv4() };
    onSave(taskWithId, updatedColumn);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        isOpen ? "" : "hidden"
      }`}
    >
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="bg-white p-4 rounded shadow-md z-50">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Task</h2>
        <label htmlFor="editedTask" className="block text-gray-800">
          Task:
        </label>
        <input
          type="text"
          id="editedTask"
          value={editedTask.name}
          onChange={(e) =>
            setEditedTask({ ...editedTask, name: e.target.value })
          }
          className="w-full p-2 border rounded mb-4"
        />
        <label htmlFor="description" className="block text-gray-800">
          Description:
        </label>
        <textarea
          id="description"
          value={editedTask.description}
          onChange={(e) =>
            setEditedTask({ ...editedTask, description: e.target.value })
          }
          className="w-full p-2 border rounded mb-4"
        ></textarea>
        <label htmlFor="tag" className="block text-gray-800">
          Tag:
        </label>
        <input
          type="text"
          id="tag"
          value={editedTask.tag}
          onChange={(e) =>
            setEditedTask({ ...editedTask, tag: e.target.value })
          }
          className="w-full p-2 border rounded mb-4"
        />
        <label htmlFor="dueDate" className="block text-gray-800">
          Due Date:
        </label>
        <input
          type="date"
          id="dueDate"
          value={editedTask.dueDate}
          onChange={(e) =>
            setEditedTask({ ...editedTask, dueDate: e.target.value })
          }
          className="w-full p-2 border rounded mb-4"
        />
        <label htmlFor="priority" className="block text-gray-800">
          Priority:
        </label>
        <input
          type="checkbox"
          id="priority"
          checked={editedTask.priority}
          onChange={(e) =>
            setEditedTask({ ...editedTask, priority: e.target.checked })
          }
          className="ml-2"
        />
        <label htmlFor="status" className="block text-gray-800">
          Status:
        </label>
        <select
          id="status"
          value={updatedColumn}
          onChange={(e) => setUpdatedColumn(e.target.value as keyof Tasks)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="todo">To Do</option>
          <option value="inProgress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <div className="flex justify-end">
          <button
            className={`bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mr-2 ${
              !isFormValid && "opacity-50 cursor-not-allowed"
            }`}
            onClick={handleSave}
            disabled={!isFormValid}
          >
            Save
          </button>
          <button
            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
