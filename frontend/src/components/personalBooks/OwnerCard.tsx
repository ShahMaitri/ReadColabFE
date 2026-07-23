import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Stack,
  Chip,
  Rating,
  LinearProgress,
} from '@mui/material';
import type { OwnerProfileData } from '../../api/personalBook.api';
import VerifiedIcon from '@mui/icons-material/Verified';
import BookIcon from '@mui/icons-material/Book';
import HandshakeIcon from '@mui/icons-material/Handshake';

interface OwnerCardProps {
  profile: OwnerProfileData;
}

export const OwnerCard: React.FC<OwnerCardProps> = ({ profile }) => {
  const memberMonths = Math.floor(
    (new Date().getTime() - new Date(profile.memberSince).getTime()) /
      (1000 * 60 * 60 * 24 * 30)
  );

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          {/* Header with Avatar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={profile.avatar}
              alt={profile.name}
              sx={{ width: 64, height: 64 }}
            >
              {profile.name?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6">{profile.name}</Typography>
                {profile.verifiedBadge && (
                  <VerifiedIcon
                    sx={{ color: 'primary.main', fontSize: 20 }}
                    titleAccess="Verified member"
                  />
                )}
              </Box>
              <Typography variant="caption" color="textSecondary">
                {profile.email}
              </Typography>
            </Box>
          </Box>

          {/* Member Since */}
          <Typography variant="caption" color="textSecondary">
            Member for {memberMonths} months
          </Typography>

          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating value={profile.averageRating} readOnly size="small" precision={0.5} />
            <Typography variant="body2" color="textSecondary">
              {profile.averageRating.toFixed(1)}/5
            </Typography>
          </Box>

          {/* Statistics */}
          <Stack spacing={1.5}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BookIcon sx={{ fontSize: 18 }} />
                  Books Shared
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {profile.booksShared}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HandshakeIcon sx={{ fontSize: 18 }} />
                  Successful Lending
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {profile.successfulLending}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="textSecondary">
                  Return Reliability
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {profile.successfulReturnPercentage.toFixed(0)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={profile.successfulReturnPercentage}
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Box>
          </Stack>

          {/* Badges */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {profile.averageRating >= 4.5 && (
              <Chip label="Highly Rated" size="small" color="primary" variant="filled" />
            )}
            {profile.successfulReturnPercentage >= 95 && (
              <Chip label="Reliable" size="small" color="success" variant="filled" />
            )}
            {profile.booksShared >= 10 && (
              <Chip label="Active Sharer" size="small" color="info" variant="filled" />
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
