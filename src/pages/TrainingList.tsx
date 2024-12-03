/**
 * Training sessions management page component
 * This file demonstrates:
 * - Data fetching and display with DataGrid
 * - Date formatting with date-fns
 * - Custom cell rendering
 * - Delete functionality
 * - Search and filtering
 */

import { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { GridRenderCellParams } from '@mui/x-data-grid/models';
import { TextField, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { toast } from 'sonner';
import api, { Training } from '../services/api';

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
 * Generic confirmation dialog for delete operations
 * @param props - Dialog properties including open state, callbacks, and content
 * @returns JSX.Element - The rendered dialog
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
 * Main training list component
 * Demonstrates:
 * - Data fetching and state management
 * - Search functionality
 * - Delete operations
 * - DataGrid implementation with custom cell rendering
 */
const TrainingList = () => {
  // State for managing training data and UI state
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTrainingId, setSelectedTrainingId] = useState<number | null>(null);

  // Fetch trainings on component mount
  useEffect(() => {
    fetchTrainings();
  }, []);

  /**
   * Fetches training data from the API
   * - Sets loading state during fetch
   * - Updates trainings state with fetched data
   * - Handles error cases with toast notifications
   * - Resets loading state after completion
   */
  const fetchTrainings = async () => {
    try {
      const data = await api.getTrainings();
      setTrainings(data);
    } catch (error) {
      console.error('Error fetching trainings:', error);
      toast.error('Failed to load training sessions');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the deletion of a training session
   * - Validates selected training ID
   * - Calls API to delete the training
   * - Refreshes training list on success
   * - Manages dialog state and notifications
   * - Handles error cases with toast notifications
   */
  const handleDeleteTraining = async () => {
    if (!selectedTrainingId) return;
    try {
      await api.deleteTraining(selectedTrainingId);
      await fetchTrainings();
      setDeleteDialogOpen(false);
      setSelectedTrainingId(null);
      toast.success('Training session deleted successfully');
    } catch (error) {
      console.error('Error deleting training:', error);
      toast.error('Failed to delete training session');
    }
  };

  /**
   * DataGrid column definitions
   * Includes:
   * - Date formatting with date-fns
   * - Customer name concatenation
   * - Delete action with confirmation dialog
   */
  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      renderCell: (params: GridRenderCellParams<Training>) => {
        try {
          const date = new Date(params.row.date);
          return format(date, 'dd.MM.yyyy HH:mm');
        } catch {
          return 'Invalid date';
        }
      },
    },
    { field: 'duration', headerName: 'Duration (min)', flex: 1 },
    { field: 'activity', headerName: 'Activity', flex: 1 },
    {
      field: 'customer',
      headerName: 'Customer',
      flex: 1,
      renderCell: (params: GridRenderCellParams<Training>) => {
        const customer = params.row?.customer;
        if (!customer) return 'N/A';
        return `${customer.firstname} ${customer.lastname}`;
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      flex: 1,
      getActions: (params) => [
        <Tooltip title="Delete training session" arrow>
          <span>
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => {
                setSelectedTrainingId(params.row.id);
                setDeleteDialogOpen(true);
              }}
              showInMenu={false}
            />
          </span>
        </Tooltip>,
      ],
    },
  ];

  /**
   * Filters training sessions based on search term
   * Matches against:
   * - Activity name
   * - Customer full name
   */
  const filteredTrainings = trainings.filter((training) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      training.activity.toLowerCase().includes(searchStr) ||
      (training.customer && 
        `${training.customer.firstname} ${training.customer.lastname}`
          .toLowerCase()
          .includes(searchStr))
    );
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Trainings
      </Typography>
      {/* Search field for filtering trainings */}
      <TextField
        label="Search Trainings"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {/* DataGrid for displaying trainings with sorting and pagination */}
      <Box sx={{ height: 600, width: '1440px', maxWidth: '100%' }}>
        <DataGrid
          rows={filteredTrainings}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
            sorting: {
              sortModel: [{ field: 'date', sort: 'desc' }],
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Confirmation dialog for delete operations */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteTraining}
        title="Delete Training"
        content="Are you sure you want to delete this training session?"
      />
    </Box>
  );
};

export default TrainingList; 