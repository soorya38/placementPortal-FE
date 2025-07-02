
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Company, User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Check, File } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCompanies: 0,
    contactedCompanies: 0,
    pendingApprovals: 0,
    assignedCompanies: 0
  });

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setStats({
      totalCompanies: 45,
      contactedCompanies: 32,
      pendingApprovals: 8,
      assignedCompanies: user?.role === 'Officer' ? 12 : 0
    });
  }, [user]);

  const dashboardCards = [
    {
      title: 'Total Companies',
      value: stats.totalCompanies,
      description: 'Companies in database',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Contacted Companies',
      value: stats.contactedCompanies,
      description: 'Companies we\'ve reached out to',
      icon: Check,
      color: 'bg-green-500'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      description: 'Updates awaiting approval',
      icon: File,
      color: 'bg-yellow-500',
      roles: ['Admin', 'Manager']
    },
    {
      title: 'My Assigned Companies',
      value: stats.assignedCompanies,
      description: 'Companies assigned to you',
      icon: Users,
      color: 'bg-purple-500',
      roles: ['Officer']
    }
  ];

  const filteredCards = dashboardCards.filter(card => 
    !card.roles || card.roles.includes(user?.role || '')
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.username}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCards.map((card, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for your role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {user?.role === 'Admin' && (
              <>
                <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium">Create New User</h3>
                  <p className="text-sm text-gray-600">Add a new user to the system</p>
                </div>
                <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium">Generate Reports</h3>
                  <p className="text-sm text-gray-600">Export company data to Excel</p>
                </div>
              </>
            )}
            {(user?.role === 'Admin' || user?.role === 'Manager') && (
              <>
                <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium">Add New Company</h3>
                  <p className="text-sm text-gray-600">Register a new company</p>
                </div>
                <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium">Review Pending Updates</h3>
                  <p className="text-sm text-gray-600">Approve or reject officer changes</p>
                </div>
              </>
            )}
            {user?.role === 'Officer' && (
              <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium">Update Company Details</h3>
                <p className="text-sm text-gray-600">Edit assigned company information</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates in the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">New company "Tech Corp" added</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Company details updated for "ABC Ltd"</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Pending approval for "XYZ Industries"</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
