import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Clock } from 'lucide-react';

const statCards = [
  {
    title: 'Total Students',
    count: '2,100',
    icon: Users,
    link: '/students',
    change: '+4.75%',
    trend: 'up'
  },
  {
    title: 'Active Classes',
    count: '48',
    icon: BookOpen,
    link: '/classes',
    change: '+10.18%',
    trend: 'up'
  },
  {
    title: 'Absences Today',
    count: '12',
    icon: Clock,
    link: '/absences',
    change: '-2.35%',
    trend: 'down'
  }
];

const Dashboard = () => {
  return (
    <div className="p-8 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome to your school management dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Link 
            key={card.title}
            to={card.link}
            className="transform transition-all hover:scale-105"
          >
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <card.icon className="h-6 w-6 text-primary" />
                </div>
                <span className={`text-sm font-medium ${
                  card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.change}
                </span>
              </div>
              
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-700">{card.title}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.count}</p>
              </div>
              
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <span>View details</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;