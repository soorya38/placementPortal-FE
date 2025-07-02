
import React from 'react';
import * as XLSX from 'xlsx';
import { Company } from '@/types';
import { Button } from '@/components/ui/button';
import { File } from 'lucide-react';

interface ExcelExportProps {
  companies: Company[];
  filename?: string;
}

const ExcelExport: React.FC<ExcelExportProps> = ({ companies, filename = 'companies_report' }) => {
  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = companies.map(company => ({
      'Company ID': company.companyID,
      'Company Name': company.companyName,
      'Address': company.companyAddress,
      'Drive': company.drive,
      'Type of Drive': company.typeOfDrive,
      'Follow Up': company.followUp,
      'Contacted': company.isContacted ? 'Yes' : 'No',
      'Remarks': company.remarks,
      'Contact Details': company.contactDetails,
      'HR1 Details': company.hr1Details,
      'HR2 Details': company.hr2Details,
      'Package': company.package,
      'Assigned Officer': company.assignedOfficer || 'Unassigned',
      'Created At': new Date(company.createdAt).toLocaleDateString(),
      'Updated At': new Date(company.updatedAt).toLocaleDateString()
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Companies');
    
    // Generate Excel file and download
    const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Button onClick={exportToExcel} className="flex items-center space-x-2">
      <File className="h-4 w-4" />
      <span>Export to Excel</span>
    </Button>
  );
};

export default ExcelExport;
