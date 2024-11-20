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
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";

const App = () => {
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

  // CRUD logic
  const [formData, setFormData] = useState({
    id: "",
    email: "",
    philriceEmployee: "",
    participantType: "",
    firstNameColumn: "",
    middleName: "",
    lastNameColumn: "",
    fullName: "",
    extName: "",
    philriceName: "",
    philriceStation: "",
    philriceUnit: "",
    philricePosition: "",
    affiliationName: "",
    affiliationAddress: "",
    affiliationRegion: "",
  });

  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const [filteredEmployees, setFilteredEmployees] = useState([]); // Filtered employees

  useEffect(() => {
    const employeesRef = ref(database, "users/");
    onValue(employeesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.keys(data).map((key) => ({
          key, // Store the Firebase key for operations like delete
          ...data[key], // Include all other fields (e.g., id, email, etc.)
        }));
        setEmployees(formattedData);
        setFilteredEmployees(formattedData); // Initialize the filtered list
      }
    });
  }, []);

  // Generate employee ID based on the last ID
  useEffect(() => {
    const lastEmployeeRef = query(
      ref(database, "users/"),
      orderByChild("id"),
      limitToLast(1)
    );

    onValue(lastEmployeeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lastEmployee = Object.values(data)[0];
        const lastId = lastEmployee.id || 0; // If no ID, start from 0
        setFormData((prevData) => ({
          ...prevData,
          id: lastId + 1, // Generate the new ID
        }));
      }
    });
  }, [employees]); // Run this effect when employees list changes

  // Handle search functionality
  useEffect(() => {
    const filtered = employees.filter((employee) =>
      Object.values(employee)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.key) {
      // Update existing employee logic
      const updateData = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => {
          if (typeof value === "string") {
            return value.trim() !== ""; // Only trim strings
          }
          return value !== null && value !== undefined; // Include non-string, non-null, non-undefined values
        })
      );

      update(ref(database, `users/${formData.key}`), updateData)
        .then(() => {
          console.log("Updated successfully");
          // Reset the form after updating
          setFormData({
            id: "",
            email: "",
            philriceEmployee: "",
            participantType: "",
            firstNameColumn: "",
            middleName: "",
            lastNameColumn: "",
            fullName: "",
            extName: "",
            philriceName: "",
            philriceStation: "",
            philriceUnit: "",
            philricePosition: "",
            affiliationName: "",
            affiliationAddress: "",
            affiliationRegion: "",
          });
        })
        .catch((error) => console.error("Error updating user:", error));
    } else {
      // Add new employee logic
      const newEmployeeRef = push(ref(database, "users"));
      set(newEmployeeRef, formData)
        .then(() => {
          console.log("Added successfully");
          // Reset the form after adding
          setFormData({
            id: "",
            email: "",
            philriceEmployee: "",
            participantType: "",
            firstNameColumn: "",
            middleName: "",
            lastNameColumn: "",
            fullName: "",
            extName: "",
            philriceName: "",
            philriceStation: "",
            philriceUnit: "",
            philricePosition: "",
            affiliationName: "",
            affiliationAddress: "",
            affiliationRegion: "",
          });
        })
        .catch((error) => console.error("Error adding user:", error));
    }
  };

  const handleEdit = (employee) => {
    setFormData(employee); // Set the entire employee object, including the Firebase key
  };

  const handleDelete = (key) => {
    if (!key) {
      console.error("No valid key provided for deletion.");
      alert("Unable to delete. Invalid key.");
      return;
    }
    remove(ref(database, `users/${key}`))
      .then(() => console.log(`Deleted user with key: ${key}`))
      .catch((error) => console.error("Error deleting user:", error));
  };

  return (
    <div className="container mx-auto p-4">
      <div>
        <h1 className="text-2xl font-bold mb-4 text-[#0E9046]">
          PhilRice List of Participant
        </h1>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search employees..."
        className="p-2 border border-gray-300 rounded mb-6 w-full"
      />

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
          className="col-span-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          {formData.key ? "Update Employee" : "Add Employee"}
        </button>
      </form>

      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            {[
              { header: "ID", width: "w-16" },
              { header: "Email", width: "w-48" },
              { header: "Full Name", width: "w-64" },
              { header: "Phil Rice Employee", width: "w-40" },
              { header: "Participant Type", width: "w-40" },
              { header: "Actions", width: "w-32" },
            ].map(({ header, width }) => (
              <th
                key={header}
                className={`${width} text-[#0E9046] px-4 py-3 text-left border-b border-gray-200`}>
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredEmployees.map((employee, index) => (
            <tr
              key={employee.key}
              className={index % 2 === 0 ? "bg-gray-50" : ""}>
              {[
                { data: employee.id, width: "w-16" },
                { data: employee.email, width: "w-48" },
                { data: employee.fullName, width: "w-64" },
                { data: employee.philriceEmployee, width: "w-40" },
                { data: employee.participantType, width: "w-40" },
              ].map(({ data, width }, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`${width} py-2 px-4 border-b border-gray-200`}>
                  {data || ""}
                </td>
              ))}
              <td className="py-2 px-4 border-b border-gray-200 w-32">
                <button
                  onClick={() => handleEdit(employee)}
                  className="mr-2 p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(employee.key)}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600">
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

export default App;
