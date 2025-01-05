import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ClassList() {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedPromo, setSelectedPromo] = useState('');
  const [majors, setMajors] = useState([]);
  const [promos, setPromos] = useState([]);
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
        setFilteredClasses(data);
        setLoading(false);

        // Set up filters for major and promo (could be dynamic or fetched from the backend)
        const fetchedMajors = [...new Set(data.map(item => item.major))];
        const fetchedPromos = [...new Set(data.map(item => item.promo))];
        setMajors(fetchedMajors);
        setPromos(fetchedPromos);

      } catch (err) {
        setError('Error loading classes: ' + err.message);
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Filter classes based on search term and selected filters
  const filterClasses = () => {
    let filtered = classes.filter(classItem => {
      const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMajor = selectedMajor ? classItem.major === selectedMajor : true;
      const matchesPromo = selectedPromo ? classItem.promo === selectedPromo : true;
      return matchesSearch && matchesMajor && matchesPromo;
    });
    setFilteredClasses(filtered);
  };

  // Handle input changes for search and filters
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMajorChange = (e) => {
    setSelectedMajor(e.target.value);
  };

  const handlePromoChange = (e) => {
    setSelectedPromo(e.target.value);
  };

  const handleClassClick = (classId) => {
    navigate(`/students?classId=${classId}`);
  };

  useEffect(() => {
    filterClasses();
  }, [searchTerm, selectedMajor, selectedPromo]);

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

      {/* Search and Filters */}
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by class name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="p-2 border border-gray-300 rounded-md"
        />
        <div className="flex space-x-4">
          <select
            value={selectedMajor}
            onChange={handleMajorChange}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Major</option>
            {majors.map((major, index) => (
              <option key={index} value={major}>{major}</option>
            ))}
          </select>
          <select
            value={selectedPromo}
            onChange={handlePromoChange}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Promo (Year)</option>
            {promos.map((promo, index) => (
              <option key={index} value={promo}>{promo}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Class List Table */}
      {filteredClasses.length === 0 ? (
        <p className="text-gray-500">No classes found.</p>
      ) : (
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="p-2 border border-gray-300">Class Name</th>
              <th className="p-2 border border-gray-300">Major</th>
              <th className="p-2 border border-gray-300">Promo (Graduation Year)</th>
              <th className="p-2 border border-gray-300">Coordinator</th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.map((classItem) => (
              <tr
                key={classItem.id}
                onClick={() => handleClassClick(classItem.id)}
                className="cursor-pointer hover:bg-gray-100"
              >
                <td className="p-2 border border-gray-300">{classItem.name}</td>
                <td className="p-2 border border-gray-300">{classItem.major}</td>
                <td className="p-2 border border-gray-300">{classItem.promo}</td>
                <td className="p-2 border border-gray-300">{classItem.coordinator}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ClassList;
