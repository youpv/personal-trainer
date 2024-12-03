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

const defaultFormData: Customer = {
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  streetaddress: '',
  postcode: '',
  city: '',
};

interface CustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  customer?: Customer;
  title: string;
}

interface TrainingDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (training: NewTraining) => void;
  customerUrl: string;
}

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: string;
}

const CustomerDialog = ({ open, onClose, onSave, customer, title }: CustomerDialogProps) => {
  const [formData, setFormData] = useState<Customer>(defaultFormData);

  useEffect(() => {
    setFormData(customer || defaultFormData);
  }, [customer, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const handleExportCSV = () => {
    // Define which fields to export
    const fields = ['firstname', 'lastname', 'email', 'phone', 'streetaddress', 'postcode', 'city'];
    
    // Create CSV header
    const csvHeader = fields.join(',');
    
    // Create CSV rows
    const csvRows = customers.map(customer => {
      return fields.map(field => {
        const value = customer[field as keyof Customer];
        // Escape commas and quotes in the value
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    });
    
    // Combine header and rows
    const csvString = [csvHeader, ...csvRows].join('\n');
    
    // Create blob and download
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