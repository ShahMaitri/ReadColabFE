import React from 'react';
import { Chip } from '@mui/material';

interface AvailabilityBadgeProps {
  status: 'AVAILABLE' | 'RESERVED' | 'BORROWED' | 'UNAVAILABLE' | 'SOLD' | 'DONATED';
  size?: 'small' | 'medium';
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  AVAILABLE: 'success',
  BORROWED: 'warning',
  RESERVED: 'info',
  UNAVAILABLE: 'error',
  SOLD: 'error',
  DONATED: 'error',
};

export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({ status, size = 'medium' }) => {
  return (
    <Chip
      label={status}
      color={statusColors[status] as any}
      size={size === 'small' ? 'small' : 'medium'}
      variant="filled"
    />
  );
};

interface ConditionBadgeProps {
  condition: 'NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'OLD' | 'DAMAGED';
  size?: 'small' | 'medium';
}

const conditionLabels: Record<string, string> = {
  NEW: 'New',
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  FAIR: 'Fair',
  OLD: 'Old',
  DAMAGED: 'Damaged',
};

const conditionColors: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  NEW: 'success',
  EXCELLENT: 'success',
  GOOD: 'info',
  FAIR: 'warning',
  OLD: 'warning',
  DAMAGED: 'error',
};

export const ConditionBadge: React.FC<ConditionBadgeProps> = ({ condition, size = 'medium' }) => {
  return (
    <Chip
      label={conditionLabels[condition] || condition}
      color={conditionColors[condition] as any}
      size={size === 'small' ? 'small' : 'medium'}
      variant="outlined"
    />
  );
};
