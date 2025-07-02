import React, { useState } from 'react';
import { Company } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash, Settings, User, Check, X, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ENDPOINTS } from '@/constants/api';

interface CompanyTableProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (companyId: string) => void;
}

interface EditValue {
  field: keyof Company;
  value: string;
}

const CompanyTable: React.FC<CompanyTableProps> = ({ companies = [], onEdit, onDelete }) => {
  const { user } = useAuth();
  const canDelete = user?.role === 'Admin' || user?.role === 'Manager';
  const canEdit = true; // All roles can edit
  const isOfficer = user?.role === 'Officer';
  const [editingCell, setEditingCell] = useState<{ companyId: string; field: keyof Company } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [pendingEdits, setPendingEdits] = useState<Record<string, EditValue[]>>({});

  const handleEditClick = (company: Company) => {
    if (isOfficer) {
      toast({
        title: "Update Mode",
        description: "Your changes will be submitted for approval by an admin or manager.",
      });
    }
    onEdit(company);
  };

  const handleCellClick = (company: Company, field: keyof Company) => {
    if (!isOfficer) return;
    setEditingCell({ companyId: company.id, field });
    setEditValue(String(company[field] || ''));
  };

  const handleSaveEdit = async (company: Company) => {
    if (!editingCell) return;

    // Convert the editValue to the appropriate type based on the field
    let formattedValue = editValue;
    if (editingCell.field === 'isContacted') {
      formattedValue = String(editValue === 'true');
    }

    // Add the edit to pendingEdits
    setPendingEdits(prev => ({
      ...prev,
      [company.id]: [
        ...(prev[company.id] || []),
        { field: editingCell.field, value: formattedValue }
      ]
    }));

    // Clear the editing state
    setEditingCell(null);
    setEditValue('');

    toast({
      title: "Edit Saved",
      description: "Your edit has been saved. Click the save button when you're done with all changes.",
    });
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleSubmitAllEdits = async (company: Company) => {
    const companyEdits = pendingEdits[company.id];
    if (!companyEdits || companyEdits.length === 0) return;

    try {
      // Create the update payload with all edited values
      const updatePayload = {
        company_id: company.id,
        company_name: companyEdits.find(e => e.field === 'companyName')?.value || company.companyName,
        company_address: companyEdits.find(e => e.field === 'companyAddress')?.value || company.companyAddress,
        drive: companyEdits.find(e => e.field === 'drive')?.value || company.drive,
        type_of_drive: companyEdits.find(e => e.field === 'typeOfDrive')?.value || company.typeOfDrive,
        follow_up: companyEdits.find(e => e.field === 'followUp')?.value || company.followUp,
        is_contacted: companyEdits.find(e => e.field === 'isContacted')?.value || company.isContacted,
        remarks: companyEdits.find(e => e.field === 'remarks')?.value || company.remarks,
        contact_details: companyEdits.find(e => e.field === 'contactDetails')?.value || company.contactDetails,
        hr1_details: companyEdits.find(e => e.field === 'hr1Details')?.value || company.hr1Details,
        hr2_details: companyEdits.find(e => e.field === 'hr2Details')?.value || company.hr2Details,
        package: companyEdits.find(e => e.field === 'package')?.value || company.package,
        assigned_officer: company.assignedOfficer,
        created_by: user?.username,
        status: 'pending'
      };

      const response = await fetch(ENDPOINTS.COMPANY.TEMP.UPDATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': '1'
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit update request');
      }

      // Clear pending edits for this company
      setPendingEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits[company.id];
        return newEdits;
      });

      toast({
        title: "Updates Submitted",
        description: "All your changes have been submitted for approval by an admin or manager.",
      });
    } catch (error) {
      console.error('Error saving edits:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getAssignedUserDisplay = (assignedOfficers: string[]) => {
    if (!assignedOfficers || assignedOfficers.length === 0) {
      return (
        <div className="flex items-center justify-center">
          <div className="flex items-center px-2 py-1 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-full text-gray-500 text-xs">
            <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-1">
              <User className="h-2 w-2 text-gray-400" />
            </div>
            <span className="font-medium">Unassigned</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {assignedOfficers.map((officer, index) => (
          <div key={index} className="flex items-center justify-center">
            <div className="flex items-center px-2 py-1 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/50 rounded-full shadow-sm hover:shadow-md transition-all duration-200">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mr-1">
                <User className="h-2 w-2 text-blue-600" />
              </div>
              <Badge variant="outline" className="bg-white/80 text-blue-700 border-blue-200/50 font-medium text-xs">
                {officer}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const renderEditableCell = (company: Company, field: keyof Company, value: any) => {
    const pendingEdit = pendingEdits[company.id]?.find(e => e.field === field);
    const displayValue = pendingEdit ? pendingEdit.value : value;

    if (editingCell?.companyId === company.id && editingCell?.field === field) {
      return (
        <div className="flex items-center space-x-2">
          {field === 'typeOfDrive' ? (
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="On-Campus">On-Campus</SelectItem>
                <SelectItem value="Off-Campus">Off-Campus</SelectItem>
                <SelectItem value="Virtual">Virtual</SelectItem>
              </SelectContent>
            </Select>
          ) : field === 'isContacted' ? (
            <Switch
              checked={editValue === 'true'}
              onCheckedChange={(checked) => setEditValue(String(checked))}
            />
          ) : field === 'companyAddress' || field === 'remarks' ? (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-20"
            />
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-8"
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSaveEdit(company)}
            className="h-8 w-8 p-0"
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancelEdit}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      );
    }

    const finalDisplayValue = field === 'isContacted' 
      ? (displayValue ? "Yes" : "No")
      : truncateText(String(displayValue || ''), field === 'companyAddress' || field === 'remarks' ? 40 : 20);

    return (
      <div
        onClick={() => handleCellClick(company, field)}
        className={`${isOfficer ? 'cursor-pointer hover:bg-gray-50 rounded px-2 py-1' : ''} ${pendingEdit ? 'bg-blue-50' : ''}`}
        title={finalDisplayValue}
      >
        {field === 'isContacted' ? (
          <Badge variant={displayValue ? "default" : "secondary"} className="bg-opacity-80 backdrop-blur-sm">
            {displayValue ? "Yes" : "No"}
          </Badge>
        ) : (
          finalDisplayValue
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white/50 backdrop-blur-sm shadow-lg">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm border-b border-gray-200/50">
              <TableHead className="font-semibold text-gray-700 min-w-[150px]">Company Name</TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[200px]">Address</TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[120px]">Drive</TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[100px]">Type</TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[120px]">Follow Up</TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[80px]">Contacted</TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[150px]">Contact Details</TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[120px]">HR1 Details</TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[120px]">HR2 Details</TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[100px]">Package</TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[150px]">Remarks</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center min-w-[120px]">Assigned To</TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies && companies.length > 0 ? (
              companies.map((company) => (
                <TableRow key={company.id} className="hover:bg-white/80 backdrop-blur-sm transition-all duration-200 border-b border-gray-100/50">
                  <TableCell>{renderEditableCell(company, 'companyName', company.companyName)}</TableCell>
                  <TableCell>{renderEditableCell(company, 'companyAddress', company.companyAddress)}</TableCell>
                  <TableCell>{renderEditableCell(company, 'drive', company.drive)}</TableCell>
                  <TableCell>{renderEditableCell(company, 'typeOfDrive', company.typeOfDrive)}</TableCell>
                  <TableCell>{renderEditableCell(company, 'followUp', company.followUp)}</TableCell>
                  <TableCell>{renderEditableCell(company, 'isContacted', company.isContacted)}</TableCell>
                  <TableCell>{renderEditableCell(company, 'contactDetails', company.contactDetails)}</TableCell>
                  <TableCell>{renderEditableCell(company, 'hr1Details', company.hr1Details)}</TableCell>
                  <TableCell>{renderEditableCell(company, 'hr2Details', company.hr2Details)}</TableCell>
                  <TableCell>{renderEditableCell(company, 'package', company.package)}</TableCell>
                  <TableCell>{renderEditableCell(company, 'remarks', company.remarks)}</TableCell>
                  <TableCell>
                    {getAssignedUserDisplay(company.assignedOfficer || [])}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {isOfficer && pendingEdits[company.id]?.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSubmitAllEdits(company)}
                          className="bg-white/80 backdrop-blur-sm border-green-200/50 hover:bg-green-50/80 hover:border-green-200/50 transition-all duration-200"
                        >
                          <Save className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(company)}
                          className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-blue-50/80 hover:border-blue-200/50 transition-all duration-200"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(company.id)}
                          className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-red-50/80 hover:border-red-200/50 transition-all duration-200"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-8 text-gray-500">
                  No companies found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CompanyTable;
