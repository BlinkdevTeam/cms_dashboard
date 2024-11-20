import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  update,
  remove,
} from "firebase/database";

const Dashboard = () => {
  // Initialize Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyC1id1bulVq3lLUJhkzaNBKH363gp4WqEc",
    authDomain: "philricescannerapp.firebaseapp.com",
    databaseURL: "https://philricescannerapp-default-rtdb.firebaseio.com",
    projectId: "philricescannerapp",
    storageBucket: "philricescannerapp.firebasestorage.app",
    messagingSenderId: "57763195941",
    appId: "1:57763195941:web:e1c8e98a6905b53fc2e3cc",
    measurementId: "G-1S23JZ7X56",
  };

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  // State to store form data and employees list
  const [formData, setFormData] = useState({
    id: "",
    email: "",
    philRiceEmployee: "",
    participantType: "",
    firstName: "",
    middleName: "",
    lastName: "",
    extName: "",
    philRiceName: "",
    philRiceStation: "",
    philRiceUnit: "",
    philRicePosition: "",
    affiliationName: "",
    affiliationAddress: "",
    affiliationRegion: "",
  });

  const [employees, setEmployees] = useState([]);

  // Fetch data from Firebase on component mount
  useEffect(() => {
    const employeesRef = ref(database, "employees/");
    onValue(employeesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setEmployees(formattedData);
      }
    });
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.id) {
      update(ref(database, `employees/${formData.id}`), formData);
    } else {
      const newEmployeeRef = push(ref(database, "employees"));
      set(newEmployeeRef, formData);
    }
    setFormData({
      id: "",
      email: "",
      philRiceEmployee: "",
      participantType: "",
      firstName: "",
      middleName: "",
      lastName: "",
      extName: "",
      philRiceName: "",
      philRiceStation: "",
      philRiceUnit: "",
      philRicePosition: "",
      affiliationName: "",
      affiliationAddress: "",
      affiliationRegion: "",
    });
  };

  // Handle editing an employee
  const handleEdit = (employee) => {
    setFormData(employee);
  };

  // Handle deleting an employee
  const handleDelete = (id) => {
    remove(ref(database, `employees/${id}`));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PhilRice CRUD App</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-6">
        {Object.keys(formData).map((key) =>
          key !== "id" ? (
            <input
              key={key}
              name={key}
              value={formData[key]}
              onChange={handleChange}
              placeholder={key.replace(/([A-Z])/g, " $1").trim()}
              className="p-2 border border-gray-300 rounded"
            />
          ) : null
        )}
        <button
          type="submit"
          className="col-span-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {formData.id ? "Update Employee" : "Add Employee"}
        </button>
      </form>

      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            {Object.keys(formData).map(
              (key) =>
                key !== "id" && (
                  <th
                    key={key}
                    className="py-2 px-4 border-b border-gray-200 text-left"
                  >
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </th>
                )
            )}
            <th className="py-2 px-4 border-b border-gray-200">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              {Object.keys(formData).map(
                (key) =>
                  key !== "id" && (
                    <td key={key} className="py-2 px-4 border-b border-gray-200">
                      {employee[key]}
                    </td>
                  )
              )}
              <td className="py-2 px-4 border-b border-gray-200">
                <button
                  onClick={() => handleEdit(employee)}
                  className="mr-2 p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(employee.id)}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
