import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ClassList() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('http://localhost:5000/classes');
        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }
        const data = await response.json();
        setClasses(data);
        setLoading(false);
      } catch (err) {
        setError('Error loading classes: ' + err.message);
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleClassClick = (classId) => {
    navigate(`/students?classId=${classId}`);
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">Loading classes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">List of Classes</h2>
      {classes.length === 0 ? (
        <p className="text-gray-500">No classes found.</p>
      ) : (
        <ul className="space-y-2">
          {classes.map((classItem) => (
            <li key={classItem.id}>
              <button
                onClick={() => handleClassClick(classItem.id)}
                className="w-full p-2 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer text-left"
              >
                {classItem.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ClassList;