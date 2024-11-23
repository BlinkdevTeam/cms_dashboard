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
import "./loader.css";

const App = () => {
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
    participantType: "",
    firstName: "",
    philriceEmployee: "",
    middleName: "",
    philricePosition: "",
    lastName: "",
    philriceStation: "",
    fullName: "",
    philriceUnit: "",
    extName: "",
    philriceName: "Philippine Rice Research Institute",
    affiliationName: "",
    affiliationAddress: "",
    affiliationRegion: "",
  });

  const placeholderMap = {
    email: "Enter your email",
    participantType: "Enter participant type (Presenter or Participant)",
    firstName: "Enter your first name",
    philriceEmployee: "Are you a PhilRice employee? (Yes / No)",
    middleName: "Enter your middle name",
    philricePosition: "Enter your PhilRice position",
    lastName: "Enter your last name",
    philriceStation: "Enter your PhilRice station",
    fullName: "Full name will be auto-generated",
    philriceUnit: "Enter your PhilRice unit",
    extName: "Enter your extension name, if any",
    philriceName: "Enter your PhilRice name",
    affiliationName: "Enter your affiliation name",
    affiliationAddress: "Enter your affiliation address",
    affiliationRegion: "Enter your affiliation region",
  };

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      fullName: `${prevData.firstName} ${prevData.lastName}`.trim(),
    }));
  }, [formData.firstName, formData.lastName]);

  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const employeesRef = ref(database, "users/");
    onValue(employeesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.keys(data).map((key) => ({
          key,
          ...data[key],
        }));
        setEmployees(formattedData);
        setFilteredEmployees(formattedData);
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
  }, [employees]);

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
    setLoading(true);

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
        .catch((error) => {
          console.error("Error updating user:", error);
        })
        .finally(() => {
          setLoading(false); // Hide loader after the update process
        });
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
        .catch((error) => {
          console.error("Error adding user:", error);
        })
        .finally(() => {
          setLoading(false); // Hide loader after the add process
        });
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

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // This adds a smooth scrolling animation
    });
  };

  return (
    <div className="container-full px-8 mx-auto p-4">
      <div className="w-full flex justify-center items-center py-4 px-8 bg-[#0E9046]">
        <h1 className="text-4xl font-bold text-white">
          PhilRice List of Participant
        </h1>
      </div>

      <div className="my-4">
        <div className="text-red-500 font-bold text-lg">
          Form Completion Instructions:
        </div>
        <ul className="list-disc pl-5 italic">
          <li>Please ensure all fields in the form are completed.</li>
          <li>
            If a field does not apply to your situation, write{" "}
            <span className="text-green-600">"N/A"</span> (Not Applicable) in
            the space provided.
          </li>
          <li>
            Double-check your responses before submitting to avoid delays in
            processing.
          </li>
        </ul>
      </div>

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-gray-800 z-50">
          <div className="loader"></div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-6">
        {Object.keys(formData).map((key) => {
          if (key === "id") return null; // Skip the id field

          return (
            <div key={key} className="flex flex-col">
              <label
                htmlFor={key}
                className="text-sm font-medium text-[#0E9046] mb-1">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </label>

              {/* Dropdown for philriceEmployee */}
              {key === "philriceEmployee" ? (
                <select
                  id={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded">
                  <option value="">Select employee type</option>
                  <option value="PhilRice">PhilRice</option>
                  <option value="External">External</option>
                </select>
              ) : /* Dropdown for participantType */
              key === "participantType" ? (
                <select
                  id={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded">
                  <option value="">Select participant type</option>
                  <option value="Participant">Participant</option>
                  <option value="Presenter">Presenter</option>
                </select>
              ) : (
                // Render input for other fields
                <input
                  id={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  placeholder={placeholderMap[key] || `Enter ${key}`}
                  className="p-2 border border-gray-300 rounded"
                />
              )}
            </div>
          );
        })}

        <button
          onClick={() => {
            window.location.reload();
          }}
          type="submit"
          disabled={
            !Object.keys(formData).every((key) =>
              key === "id" ? true : formData[key].trim() !== ""
            )
          } // Disable if any field is empty
          className={`col-span-2 p-2 rounded text-white ${
            Object.keys(formData).every((key) =>
              key === "id" ? true : formData[key].trim() !== ""
            )
              ? "bg-[#0E9046]" // Enabled state
              : "bg-gray-400 cursor-not-allowed" // Disabled state
          }`}>
          {formData.key ? "Update Employee" : "Add Employee"}
        </button>
      </form>

      {/* Search Bar */}
      <div className="mt-12 mb-6 w-full flex flex-col">
        <span className="text-2xl font-bold mb-4 text-[#0E9046] italic">
          Search here...
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search employees..."
          className="p-2 border-[2px] border-gray-400 rounded w-4/12"
        />
      </div>

      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            {[
              { header: "ID", width: "w-16" },
              { header: "Email", width: "w-48" },
              { header: "Full Name", width: "w-64" },
              { header: "Phil Rice Employee", width: "w-40" },
              { header: "Participant Type", width: "w-40" },
              { header: "Time Arrival", width: "w-40" },
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
                { data: employee.timeAttended, width: "w-40" },
              ].map(({ data, width }, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`${width} py-2 px-4 border-b border-gray-200`}>
                  {data || ""}
                </td>
              ))}
              <td className="py-2 px-4 border-b border-gray-200 w-32">
                <button
                  onClick={() => {
                    handleEdit(employee);
                    handleScrollToTop();
                  }}
                  className="mr-2 p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                  Edit
                </button>
                {/* <button
                  onClick={() => handleDelete(employee.key)}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600">
                  Delete
                </button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
