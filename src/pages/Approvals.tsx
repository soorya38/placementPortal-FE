import React, { useState, useEffect } from 'react';
import { PendingUpdate } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Check, Trash } from 'lucide-react';
import { ENDPOINTS } from '@/constants/api';

const Approvals: React.FC = () => {
  const { user } = useAuth();
  const [pendingUpdates, setPendingUpdates] = useState<PendingUpdate[]>([]);

  useEffect(() => {
    const fetchPendingUpdates = async () => {
      try {
        const response = await fetch(ENDPOINTS.COMPANY.TEMP.LIST, {
          headers: {
            'ngrok-skip-browser-warning': '1'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch pending updates');
        }
        const data = await response.json();
        
        // Transform the API response into PendingUpdate format
        const transformedUpdates: PendingUpdate[] = (data || []).map((item: any) => ({
          id: item.id,
          companyID: item.id,
          originalData: {
            companyID: item.id,
            companyName: item.companyName,
            companyAddress: item.companyAddress,
            drive: item.drive,
            typeOfDrive: item.typeOfDrive,
            followUp: item.followUp,
            isContacted: item.isContacted,
            remarks: item.remarks,
            contactDetails: item.contactDetails,
            hr1Details: item.hr1Details,
            hr2Details: item.hr2Details,
            package: item.package,
            assignedOfficer: item.assignedOfficer,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          },
          proposedChanges: {
            // Since the API doesn't provide proposed changes directly,
            // we'll use the current data as proposed changes
            companyName: item.companyName,
            companyAddress: item.companyAddress,
            drive: item.drive,
            typeOfDrive: item.typeOfDrive,
            followUp: item.followUp,
            isContacted: item.isContacted,
            remarks: item.remarks,
            contactDetails: item.contactDetails,
            hr1Details: item.hr1Details,
            hr2Details: item.hr2Details,
            package: item.package,
            assignedOfficer: item.assignedOfficer
          },
          requestedBy: item.assignedOfficer?.[0] || 'Unknown',
          requestedAt: item.createdAt,
          status: 'pending'
        }));

        setPendingUpdates(transformedUpdates);
      } catch (error) {
        console.error('Error fetching pending updates:', error);
        toast({
          title: "Error",
          description: "Failed to fetch pending updates. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchPendingUpdates();
  }, []);

  const handleApprove = async (updateId: string) => {
    try {
      const response = await fetch(ENDPOINTS.COMPANY.TEMP.APPROVE(updateId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          
              'ngrok-skip-browser-warning': '1'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve update');
      }

      // Remove the approved update from the list
      setPendingUpdates(prev => prev.filter(update => update.id !== updateId));
      
      toast({
        title: "Update Approved",
        description: "The company update has been approved and applied.",
      });
    } catch (error) {
      console.error('Error approving update:', error);
      toast({
        title: "Error",
        description: "Failed to approve update. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = (updateId: string) => {
    setPendingUpdates(prev => prev.map(update => 
      update.id === updateId 
        ? { 
            ...update, 
            status: 'rejected', 
            reviewedBy: user?.username,
            reviewedAt: new Date().toISOString()
          }
        : update
    ));
    
    toast({
      title: "Update Rejected",
      description: "The company update has been rejected.",
      variant: "destructive"
    });
  };

  const pendingOnly = pendingUpdates.filter(update => update.status === 'pending');

  if (user?.role === 'Officer') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only administrators and managers can approve updates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-600">Review and approve officer updates to company data</p>
      </div>

      {pendingOnly.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">No Pending Approvals</h3>
              <p className="text-gray-600">All updates have been reviewed.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingOnly.map((update) => (
            <Card key={update.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Update for {update.originalData.companyName}
                    </CardTitle>
                    <CardDescription>
                      Requested by {update.requestedBy} on {new Date(update.requestedAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Proposed Changes:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {Object.entries(update.proposedChanges).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="text-green-600">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleReject(update.id)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button onClick={() => handleApprove(update.id)}>
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Approvals;
