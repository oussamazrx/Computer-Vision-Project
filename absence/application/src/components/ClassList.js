import React from 'react';
import { useNavigate } from 'react-router-dom';

function ClassList({ classes, onSelectClass }) {
  const navigate = useNavigate();

  const handleClassClick = (classId) => {
    onSelectClass(classId);
    navigate('/students');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">List of Classes</h2>
      <ul className="space-y-2">
        {classes.map((classItem) => (
          <li key={classItem.id}>
            <button
              onClick={() => handleClassClick(classItem.id)}
              className="w-full p-2 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              {classItem.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ClassList;