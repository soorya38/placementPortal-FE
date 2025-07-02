
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Calendar, 
  Settings, 
  File,
  Check,
  Building2
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    // {
    //   name: 'Dashboard',
    //   path: '/dashboard',
    //   icon: Settings,
    //   roles: ['Admin', 'Manager', 'Officer']
    // },
    {
      name: 'Companies',
      path: '/companies',
      icon: Building2,
      roles: ['Admin', 'Manager', 'Officer']
    },
    {
      name: 'Calendar',
      path: '/calendar',
      icon: Calendar,
      roles: ['Admin', 'Manager', 'Officer']
    },
    {
      name: 'User Management',
      path: '/users',
      icon: Users,
      roles: ['Admin']
    },
    {
      name: 'Pending Approvals',
      path: '/approvals',
      icon: Check,
      roles: ['Admin', 'Manager']
    },
    // {
    //   name: 'Reports',
    //   path: '/reports',
    //   icon: File,
    //   roles: ['Admin', 'Manager']
    // }
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <nav className="space-y-2">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
