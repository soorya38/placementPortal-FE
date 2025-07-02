
import React, { useState, useEffect } from 'react';
import { Company } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import ExcelExport from '@/components/Reports/ExcelExport';
import { File, Calendar, Users, Check } from 'lucide-react';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockCompanies: Company[] = [
      {
        companyID: '1',
        companyName: 'Tech Solutions Inc',
        companyAddress: '123 Tech Street, Silicon Valley, CA',
        drive: 'Campus Drive 2024',
        typeOfDrive: 'On-Campus',
        followUp: 'Follow up next week',
        isContacted: true,
        remarks: 'Interested in CS students',
        contactDetails: 'hr@techsolutions.com',
        hr1Details: 'John Doe - 555-0101',
        hr2Details: 'Jane Smith - 555-0102',
        package: '12 LPA',
        assignedOfficer: 'officer',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:45:00Z'
      },
      {
        companyID: '2',
        companyName: 'Digital Innovations Ltd',
        companyAddress: '456 Innovation Drive, Austin, TX',
        drive: 'Virtual Drive 2024',
        typeOfDrive: 'Virtual',
        followUp: 'Awaiting response',
        isContacted: false,
        remarks: 'Looking for software engineers',
        contactDetails: 'careers@digitalinnovations.com',
        hr1Details: 'Mike Johnson - 555-0201',
        hr2Details: 'Sarah Wilson - 555-0202',
        package: '15 LPA',
        assignedOfficer: '',
        createdAt: '2024-01-10T09:15:00Z',
        updatedAt: '2024-01-18T16:20:00Z'
      }
    ];
    setCompanies(mockCompanies);
    setFilteredCompanies(mockCompanies);
  }, []);

  useEffect(() => {
    let filtered = companies;
    
    switch (filterType) {
      case 'contacted':
        filtered = companies.filter(c => c.isContacted);
        break;
      case 'not-contacted':
        filtered = companies.filter(c => !c.isContacted);
        break;
      case 'assigned':
        filtered = companies.filter(c => c.assignedOfficer);
        break;
      case 'unassigned':
        filtered = companies.filter(c => !c.assignedOfficer);
        break;
      default:
        filtered = companies;
    }
    
    setFilteredCompanies(filtered);
  }, [filterType, companies]);

  const stats = {
    total: companies.length,
    contacted: companies.filter(c => c.isContacted).length,
    assigned: companies.filter(c => c.assignedOfficer).length,
    onCampus: companies.filter(c => c.typeOfDrive === 'On-Campus').length
  };

  if (user?.role === 'Officer') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only administrators and managers can generate reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate and export company placement reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">In database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contacted}</div>
            <p className="text-xs text-muted-foreground">Companies reached</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assigned}</div>
            <p className="text-xs text-muted-foreground">To officers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Campus Drives</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onCampus}</div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <CardDescription>Generate Excel reports with company data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  <SelectItem value="contacted">Contacted Companies</SelectItem>
                  <SelectItem value="not-contacted">Not Contacted</SelectItem>
                  <SelectItem value="assigned">Assigned Companies</SelectItem>
                  <SelectItem value="unassigned">Unassigned Companies</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <ExcelExport 
              companies={filteredCompanies} 
              filename={`${filterType}_companies_report`}
            />
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredCompanies.length} companies will be included in the report
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
          <CardDescription>Preview of companies that will be included</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredCompanies.map((company) => (
              <div key={company.companyID} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <p className="font-medium">{company.companyName}</p>
                  <p className="text-sm text-gray-600">{company.typeOfDrive} - {company.package}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {company.isContacted ? 'Contacted' : 'Not Contacted'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
