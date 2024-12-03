/**
 * Statistics page component displaying training activity data in a bar chart
 * This file demonstrates:
 * - Data visualization with Recharts
 * - Data aggregation with Lodash
 * - Responsive chart implementation
 * - Loading state handling
 */

import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { groupBy, sumBy } from 'lodash';
import { toast } from 'sonner';
import api from '../services/api';

interface ActivityStats {
  activity: string;
  duration: number;
}

const CHART_MARGINS = { top: 20, right: 30, left: 40, bottom: 5 } as const;

/**
 * Statistics page component that displays training durations by activity
 * Demonstrates:
 * - Data fetching and transformation
 * - Chart configuration
 * - Loading state management
 */
const StatisticsPage = () => {
  const [stats, setStats] = useState<ActivityStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const trainings = await api.getTrainings();
        const groupedStats = groupBy(trainings, 'activity');
        const activityStats = Object.entries(groupedStats).map(([activity, trainings]) => ({
          activity,
          duration: sumBy(trainings, 'duration'),
        }));
        
        setStats(activityStats.sort((a, b) => b.duration - a.duration));
      } catch (error) {
        console.error('Error fetching training statistics:', error);
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const tooltipFormatter = (value: number) => [`${value} min`, 'Duration'];

  const chartContent = useMemo(() => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={stats}
        margin={CHART_MARGINS}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="activity"
          tick={{ fill: '#334155' }}
        />
        <YAxis
          label={{ 
            value: 'Duration (min)', 
            angle: -90, 
            position: 'insideLeft',
            style: { fill: '#334155' }
          }}
          tick={{ fill: '#334155' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
          }}
          formatter={tooltipFormatter}
        />
        <Bar 
          dataKey="duration" 
          fill="#2563eb"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  ), [stats]);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%', 
          minHeight: 400 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', minHeight: 'calc(100vh - 180px)' }}>
      <Typography variant="h4" gutterBottom>
        Training Statistics
      </Typography>
      
      <Box sx={{ 
        height: 'calc(100vh - 250px)',
        minHeight: 600,
        backgroundColor: 'white',
        p: 4,
        borderRadius: 1,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
          Total Minutes by Activity
        </Typography>
        {chartContent}
      </Box>
    </Box>
  );
};

export default StatisticsPage; 