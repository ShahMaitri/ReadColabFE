import { Box, Card, CardContent, Skeleton, Stack } from '@mui/material';

export const ReviewSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="20%" />
                </Box>
              </Box>
              <Skeleton variant="text" width="30%" />
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};
