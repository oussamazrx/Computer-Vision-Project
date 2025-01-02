import React, { useState, useEffect } from 'react';

const Students = ({ classFilter }) => {
  const [students, setStudents] = useState([]);

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