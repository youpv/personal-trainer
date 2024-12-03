/**
 * Customer management page component
 * This file demonstrates:
 * - CRUD operations with REST API
 * - Material-UI DataGrid implementation
 * - Form handling with dialogs
 * - CSV export functionality
 * - Search and filtering
 */

import { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { TextField, Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'sonner';
import api, { Customer, NewTraining } from '../services/api';

/**
 * Default form data structure for new customer creation.
 * Contains empty strings for all required customer fields.
 * Used to reset the form when adding a new customer.
 */
const defaultFormData: Customer = {
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  streetaddress: '',
  postcode: '',
  city: '',
};

/**
 * Props for the customer dialog component
 */
interface CustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  customer?: Customer;
  title: string;
}

/**
 * Props for the training dialog component
 */
interface TrainingDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (training: NewTraining) => void;
  customerUrl: string;
}

/**
 * Props for the delete confirmation dialog
 */
interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: string;
}

/**
 * Dialog component for adding or editing customer information.
 * Handles form state and validation for customer data.
 * 
 * @param {boolean} open - Controls dialog visibility
 * @param {Function} onClose - Callback function to handle dialog close
 * @param {Function} onSave - Callback function to handle form submission
 * @param {Customer} [customer] - Optional existing customer data for editing
 * @param {string} title - Dialog title text
 */
const CustomerDialog = ({ open, onClose, onSave, customer, title }: CustomerDialogProps) => {
  const [formData, setFormData] = useState<Customer>(defaultFormData);

  useEffect(() => {
    setFormData(customer || defaultFormData);
  }, [customer, open]);

  /**
   * Handles form input changes by updating the form state.
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handles form submission and triggers the save callback.
   * Prevents default form submission behavior.
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              name="firstname"
              label="First Name"
              value={formData.firstname}
              onChange={handleChange}
              required
            />
            <TextField
              name="lastname"
              label="Last Name"
              value={formData.lastname}
              onChange={handleChange}
              required
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              name="phone"
              label="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <TextField
              name="streetaddress"
              label="Street Address"
              value={formData.streetaddress}
              onChange={handleChange}
              required
            />
            <TextField
              name="postcode"
              label="Postcode"
              value={formData.postcode}
              onChange={handleChange}
              required
            />
            <TextField
              name="city"
              label="City"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

/**
 * Dialog component for adding new training sessions to a customer.
 * Provides date-time selection and training details input.
 * 
 * @param {boolean} open - Controls dialog visibility
 * @param {Function} onClose - Callback function to handle dialog close
 * @param {Function} onSave - Callback function to handle form submission
 * @param {string} customerUrl - API URL reference to the associated customer
 */
const TrainingDialog = ({ open, onClose, onSave, customerUrl }: TrainingDialogProps) => {
  const [formData, setFormData] = useState<Omit<NewTraining, 'customer'>>({
    date: new Date().toISOString(),
    duration: 60,
    activity: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, customer: customerUrl });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add Training</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Date and Time"
                value={new Date(formData.date)}
                onChange={(newValue) => {
                  if (newValue) {
                    setFormData({ ...formData, date: newValue.toISOString() });
                  }
                }}
              />
            </LocalizationProvider>
            <TextField
              name="duration"
              label="Duration (minutes)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              required
            />
            <TextField
              name="activity"
              label="Activity"
              value={formData.activity}
              onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

/**
 * Generic confirmation dialog for delete operations
 */
const DeleteConfirmDialog = ({ open, onClose, onConfirm, title, content }: DeleteConfirmDialogProps) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>{content}</DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onConfirm} color="error" variant="contained">Delete</Button>
    </DialogActions>
  </Dialog>
);

/**
 * Main customer management component.
 * Provides functionality for:
 * - Displaying customers in a data grid
 * - Adding, editing, and deleting customers
 * - Adding training sessions to customers
 * - Searching and filtering customers
 * - Exporting customer data to CSV
 * 
 * @returns {JSX.Element} Rendered customer management interface
 */
const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCustomerUrl, setSelectedCustomerUrl] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  /**
   * Fetches customer data from the API and updates the local state.
   * Handles loading state and error notifications.
   */
  const fetchCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  /**
   * Handles the creation of a new customer.
   * Sends API request and updates the customer list on success.
   * 
   * @param {Customer} customer - New customer data to be added
   */
  const handleAddCustomer = async (customer: Customer) => {
    try {
      await api.addCustomer(customer);
      await fetchCustomers();
      setCustomerDialogOpen(false);
      toast.success('Customer added successfully');
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Failed to add customer');
    }
  };

  /**
   * Handles updating an existing customer's information.
   * Requires a valid customer URL reference for the API call.
   * 
   * @param {Customer} customer - Updated customer data
   */
  const handleEditCustomer = async (customer: Customer) => {
    if (!selectedCustomer?._links?.self.href) return;
    try {
      await api.updateCustomer(selectedCustomer._links.self.href, customer);
      await fetchCustomers();
      setCustomerDialogOpen(false);
      setIsEditing(false);
      setSelectedCustomer(null);
      toast.success('Customer updated successfully');
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    }
  };

  /**
   * Handles customer deletion after confirmation.
   * Removes the customer and their associated training sessions.
   * Requires a valid customer URL reference.
   */
  const handleDeleteCustomer = async () => {
    if (!selectedCustomerUrl) return;
    try {
      await api.deleteCustomer(selectedCustomerUrl);
      await fetchCustomers();
      setDeleteDialogOpen(false);
      setSelectedCustomerUrl('');
      toast.success('Customer deleted successfully');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  /**
   * Handles the creation of a new training session for a customer.
   * Associates the training with the selected customer via their URL.
   * 
   * @param {NewTraining} training - New training session data
   */
  const handleAddTraining = async (training: NewTraining) => {
    try {
      await api.addTraining(training);
      setTrainingDialogOpen(false);
      toast.success('Training session added successfully');
    } catch (error) {
      console.error('Error adding training:', error);
      toast.error('Failed to add training session');
    }
  };

  /**
   * Exports customer data to a CSV file.
   * Generates a downloadable file with all customer information.
   * Handles browser compatibility for file downloads.
   */
  const handleExportCSV = () => {
    const fields = ['firstname', 'lastname', 'email', 'phone', 'streetaddress', 'postcode', 'city'];
    const csvHeader = fields.join(',');
    const csvRows = customers.map(customer => {
      return fields.map(field => {
        const value = customer[field as keyof Customer];
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    });
    
    const csvString = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'customers.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Customers exported successfully');
    }
  };

  /**
   * DataGrid column definitions with custom rendering and actions.
   * Includes:
   * - Basic customer information columns
   * - Action buttons for edit, delete, and adding training sessions
   * - Tooltip-enhanced action buttons for better UX
   */
  const columns: GridColDef[] = [
    { field: 'firstname', headerName: 'First Name', flex: 1 },
    { field: 'lastname', headerName: 'Last Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    { field: 'streetaddress', headerName: 'Address', flex: 1 },
    { field: 'postcode', headerName: 'Postcode', flex: 1 },
    { field: 'city', headerName: 'City', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      flex: 1,
      getActions: (params) => [
        <Tooltip title="Edit customer" arrow>
          <span>
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              onClick={() => {
                setSelectedCustomer(params.row);
                setIsEditing(true);
                setCustomerDialogOpen(true);
              }}
              showInMenu={false}
            />
          </span>
        </Tooltip>,
        <Tooltip title="Delete customer" arrow>
          <span>
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => {
                setSelectedCustomerUrl(params.row._links.self.href);
                setDeleteDialogOpen(true);
              }}
              showInMenu={false}
            />
          </span>
        </Tooltip>,
        <Tooltip title="Add training session" arrow>
          <span>
            <GridActionsCellItem
              icon={<FitnessCenterIcon />}
              label="Add Training"
              onClick={() => {
                setSelectedCustomerUrl(params.row._links.self.href);
                setTrainingDialogOpen(true);
              }}
              showInMenu={false}
            />
          </span>
        </Tooltip>,
      ],
    },
  ];

  /**
   * Filters the customer list based on the search term.
   * Searches across multiple fields: firstname, lastname, email, and city.
   * Case-insensitive search implementation.
   */
  const filteredCustomers = customers.filter((customer) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      customer.firstname.toLowerCase().includes(searchStr) ||
      customer.lastname.toLowerCase().includes(searchStr) ||
      customer.email.toLowerCase().includes(searchStr) ||
      customer.city.toLowerCase().includes(searchStr)
    );
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Customers
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Export to CSV" arrow>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </Tooltip>
          <Tooltip title="Add new customer" arrow>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setIsEditing(false);
                setSelectedCustomer(null);
                setCustomerDialogOpen(true);
              }}
            >
              Add Customer
            </Button>
          </Tooltip>
        </Box>
      </Box>
      
      <TextField
        label="Search Customers"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <Box sx={{ height: 600, width: '1440px', maxWidth: '100%' }}>
        <DataGrid
          rows={filteredCustomers}
          columns={columns}
          loading={loading}
          getRowId={(row) => row._links.self.href}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
            sorting: {
              sortModel: [{ field: 'lastname', sort: 'asc' }],
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
        />
      </Box>

      <CustomerDialog
        open={customerDialogOpen}
        onClose={() => {
          setCustomerDialogOpen(false);
          setIsEditing(false);
          setSelectedCustomer(null);
        }}
        onSave={isEditing ? handleEditCustomer : handleAddCustomer}
        customer={selectedCustomer || undefined}
        title={isEditing ? 'Edit Customer' : 'Add Customer'}
      />

      <TrainingDialog
        open={trainingDialogOpen}
        onClose={() => {
          setTrainingDialogOpen(false);
          setSelectedCustomerUrl('');
        }}
        onSave={handleAddTraining}
        customerUrl={selectedCustomerUrl}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteCustomer}
        title="Delete Customer"
        content="Are you sure you want to delete this customer? This will also delete all associated trainings."
      />
    </Box>
  );
};

export default CustomerList; 