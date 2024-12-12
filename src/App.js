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
  const [showLightbox, setShowLightbox] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEditLightbox, setShowEditLightbox] = useState(false);

  const [showAddLightbox, setShowAddLightbox] = useState(false);
  const [showUpdateLightbox, setShowUpdateLightbox] = useState(false);

  //new code
  const [selectedDay, setSelectedDay] = useState("");

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

  function generateRandomId(length = 8) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomId = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomId += characters[randomIndex];
    }
    return randomId;
  }

  // Fetch and set the random ID when the form loads
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      id: generateRandomId(10), // Use 10-character random ID, adjust length if needed
    }));
  }, []); // Empty dependency array to ensure this runs only once when the component mounts

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

    // Ensure that the ID is generated before showing the confirmation lightbox
    if (!formData.id) {
      setFormData((prevData) => ({
        ...prevData,
        id: generateRandomId(10), // Generate a new ID if not already set
      }));
    }

    formData.key ? setShowUpdateLightbox(true) : setShowAddLightbox(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee); // Store the selected employee
    setShowEditLightbox(true); // Open the edit confirmation lightbox
  };

  const confirmEdit = () => {
    if (!selectedEmployee) {
      console.error("No employee selected for editing.");
      alert("Unable to edit. Invalid participant data.");
      setShowEditLightbox(false);
      return;
    }

    setFormData(selectedEmployee); // Set the form data for editing
    setShowEditLightbox(false); // Close the lightbox
    handleScrollToTop(); // Scroll to the top of the form
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
      behavior: "smooth",
    });
  };

  const handleMarkAsAttend = (employee) => {
    setSelectedEmployee(employee);
    setShowLightbox(true);
  };

  const confirmMarkAttendance = () => {
    if (!selectedEmployee?.key || !selectedDay) {
      console.error("Invalid participant key or day selection.");
      alert("Unable to mark attendance. Please select a day.");
      setShowLightbox(false);
      return;
    }

    const dateTimeNow = new Date().toLocaleString();

    // Updates based on the selected day
    const updates = {
      [`day${selectedDay}timeAttended`]: dateTimeNow, // Dynamically update the selected day
      attendanceCheck: "Attend",
    };

    update(ref(database, `users/${selectedEmployee.key}`), updates)
      .then(() => {
        console.log(
          `Marked as attended for day ${selectedDay} for participant with key: ${selectedEmployee.key}`
        );
        // Optionally, alert the user or trigger another action after success
      })
      .catch((error) => {
        console.error("Error marking attendance:", error);
        alert("Failed to mark attendance. Please try again.");
      })
      .finally(() => {
        setShowLightbox(false);
        setSelectedEmployee(null);
        setSelectedDay(""); // Reset the selected day
      });
  };

  const addParticipant = () => {
    setLoading(true);

    // Generate a new random ID before adding the participant
    const newId = generateRandomId(10); // Generate a new ID

    const newEmployeeRef = push(ref(database, "users"));
    set(newEmployeeRef, { ...formData, id: newId }) // Include the new ID in the form data
      .then(() => {
        console.log("Added successfully");
        resetForm();
      })
      .catch((error) => console.error("Error adding user:", error))
      .finally(() => setLoading(false));
  };

  const updateParticipant = () => {
    setLoading(true);
    const updateData = Object.fromEntries(
      Object.entries(formData).filter(([key, value]) => {
        // Check if value is a string before calling trim
        if (typeof value === "string") {
          return value.trim() !== "";
        }
        // If value is not a string, include it only if it's truthy
        return Boolean(value);
      })
    );

    update(ref(database, `users/${formData.key}`), updateData)
      .then(() => {
        console.log("Updated successfully");
        resetForm();
      })
      .catch((error) => console.error("Error updating user:", error))
      .finally(() => setLoading(false));
  };

  const resetForm = () => {
    setFormData({
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

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-gray-800 z-50">
          <div className="loader"></div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-6">
        {Object.keys(formData).map((key) => {
          if (key === "id") return null;

          return (
            <div key={key} className="flex flex-col">
              <label
                htmlFor={key}
                className="text-sm font-medium text-[#0E9046] mb-1"
              >
                {key.replace(/([A-Z])/g, " $1").trim()}
              </label>

              {key === "philriceEmployee" ? (
                <select
                  id={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                >
                  <option value="">Select employee type</option>
                  <option value="PhilRice">PhilRice</option>
                  <option value="External">External</option>
                </select>
              ) : key === "participantType" ? (
                <select
                  id={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                >
                  <option value="">Select participant type</option>
                  <option value="Participant">Participant</option>
                  <option value="Presenter">Presenter</option>
                </select>
              ) : (
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
          type="button"
          className="col-span-2 p-2 rounded text-white bg-[#0E9046]"
          onClick={handleSubmit}
        >
          {formData.key ? "Update Participant" : "Add Participant"}
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
          placeholder="Search Participants"
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
              { header: "PhilRice Employee", width: "w-40" },
              { header: "Participant Type", width: "w-40" },
              { header: "Day 1", width: "w-32" },
              { header: "Day 2", width: "w-32" },
              { header: "Day 3", width: "w-32" },
              { header: "Day 4", width: "w-32" },
              { header: "Actions", width: "w-32" },
            ].map(({ header, width }) => (
              <th
                key={header}
                className={`${width} text-[#0E9046] px-4 py-3 text-left border-b border-gray-200`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredEmployees.map((employee, index) => (
            <tr
              key={employee.key}
              className={index % 2 === 0 ? "bg-gray-50" : ""}
            >
              {[
                { data: employee.id, width: "w-16" },
                { data: employee.email, width: "w-48" },
                { data: employee.fullName, width: "w-64" },
                { data: employee.philriceEmployee, width: "w-40" },
                { data: employee.participantType, width: "w-40" },
                { data: employee.day1timeAttended || "", width: "w-32" },
                { data: employee.day2timeAttended || "", width: "w-32" },
                { data: employee.day3timeAttended || "", width: "w-32" },
                { data: employee.day4timeAttended || "", width: "w-32" },
              ].map(({ data, width }, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`${width} py-2 px-4 border-b border-gray-200`}
                >
                  {data || "Not Attended"}
                </td>
              ))}
              <td className="py-2 px-4 border-b border-gray-200 w-32 flex gap-1">
                <button
                  onClick={() => {
                    handleEdit(employee);
                    handleScrollToTop();
                  }}
                  className="mr-2 p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                {/* <button
            onClick={() => handleDelete(employee.key)}
            className="p-2 bg-red-500 text-white rounded hover:bg-red-600">
            Delete
          </button> */}
                <button
                  onClick={() => handleMarkAsAttend(employee)}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Mark as Attend
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showEditLightbox && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Confirm Edit</h2>
            <p>
              Are you sure you want to edit the details of{" "}
              <span className="font-semibold">
                {selectedEmployee?.fullName}
              </span>
              ?
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowEditLightbox(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmEdit()}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showLightbox && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Confirm Attendance</h2>
            <p>
              Are you sure you want to mark attendance for{" "}
              <span className="font-semibold">
                {selectedEmployee?.fullName}
              </span>
              ?
            </p>

            {/* Day selection dropdown */}
            <div className="mt-4">
              <label
                htmlFor="attendanceDay"
                className="block text-sm font-medium text-gray-700"
              >
                Select Day to Mark Attendance
              </label>
              <select
                id="attendanceDay"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="p-2 mt-2 border border-gray-300 rounded"
              >
                <option value="">Select Day</option>
                <option value="1">Day 1</option>
                <option value="2">Day 2</option>
                <option value="3">Day 3</option>
                <option value="4">Day 4</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowLightbox(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmMarkAttendance()}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddLightbox && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Confirm Add</h2>
            <p>Are you sure you want to add this participant?</p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowAddLightbox(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddLightbox(false);
                  addParticipant();
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpdateLightbox && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Confirm Update</h2>
            <p>Are you sure you want to update this participant's details?</p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowUpdateLightbox(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUpdateLightbox(false);
                  updateParticipant();
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
