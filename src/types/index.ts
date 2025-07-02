export interface User {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Officer';
  createdAt: string;
}

export interface Company {
  id: string;
  companyName: string;
  companyAddress: string;
  drive: string;
  typeOfDrive: string;
  followUp: string;
  isContacted: boolean;
  remarks: string;
  contactDetails: string;
  hr1Details: string;
  hr2Details: string;
  package: string;
  assignedOfficer: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PendingUpdate {
  id: string;
  companyID: string;
  originalData: Company;
  proposedChanges: Partial<Company>;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}
