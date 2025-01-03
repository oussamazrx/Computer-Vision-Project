import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate from react-router-dom

const Students = ({ classFilter }) => {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();  // Initialize the navigate function from useNavigate hook

  useEffect(() => {
    if (classFilter) {
      console.log(`Fetching students for class: ${classFilter}`);
      fetch(`http://localhost:5000/classes/${classFilter}/students`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('Fetched students:', data); // Log the fetched students
          setStudents(data);
        })
        .catch(error => console.error('Error fetching students:', error));
    }
  }, [classFilter]);

  return (
    <div>
      <h2>Students in Class {classFilter}</h2>
      <button
        onClick={() => navigate('/add_student')}  // Use navigate function here
        className="mb-4 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Add Student
      </button>
      {students.length === 0 ? (
        <p>No students found for this class.</p>
      ) : (
        <ul>
          {students.map(student => (
            <li key={student.id}>
              {student.first_name} {student.last_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Students;
