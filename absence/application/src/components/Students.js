import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [className, setClassName] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the classId from URL search params
  const searchParams = new URLSearchParams(location.search);
  const classId = searchParams.get('classId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (classId) {
          // Fetch class details
          const classResponse = await fetch('http://localhost:5000/classes');
          const classesData = await classResponse.json();
          const currentClass = classesData.find(c => c.id === parseInt(classId));
          setClassName(currentClass ? currentClass.name : '');

          // Fetch students for the selected class
          console.log('Fetching students for class:', classId); // Debug log
          const studentsResponse = await fetch(`http://localhost:5000/classes/${classId}/students`);
          
          if (!studentsResponse.ok) {
            throw new Error(`HTTP error! status: ${studentsResponse.status}`);
          }
          
          const studentsData = await studentsResponse.json();
          console.log('Students data:', studentsData); // Debug log
          
          setStudents(studentsData);
        } else {
          // Fetch all students
          console.log('Fetching all students'); // Debug log
          const studentsResponse = await fetch('http://localhost:5000/students');
          
          if (!studentsResponse.ok) {
            throw new Error(`HTTP error! status: ${studentsResponse.status}`);
          }
          
          const studentsData = await studentsResponse.json();
          console.log('All students data:', studentsData); // Debug log
          
          setStudents(studentsData);
          setClassName('All Classes'); // Set class name to indicate all students
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err); // Debug log
        setError('Error loading students: ' + err.message);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  const handleBackClick = () => {
    navigate('/classes');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">
          {className ? `Students in ${className}` : 'Students'}
        </h2>
        <button 
          onClick={handleBackClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Classes
        </button>
      </div>
      
      {error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : students.length === 0 ? (
        <p className="text-gray-500">No students found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{student.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.first_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.class_id || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => {/* Add view details handler */}}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Students;