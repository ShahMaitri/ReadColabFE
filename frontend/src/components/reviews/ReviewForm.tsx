import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { StarRating } from './StarRating';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().max(1000, 'Comment must be 1000 characters or less').optional()
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  defaultValues?: Partial<ReviewFormValues>;
  onSubmit: (values: ReviewFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  error?: string | null;
}

export const ReviewForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save Review',
  isSubmitting = false,
  error
}: ReviewFormProps) => {
  const {
    control,
    handleSubmit,
    register,
    formState: { errors }
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: defaultValues?.rating ?? 0,
      comment: defaultValues?.comment ?? ''
    }
  });

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit({
      rating: values.rating,
      comment: values.comment?.trim() ? values.comment.trim() : undefined
    });
  });

  return (
    <Box component="form" onSubmit={submitHandler}>
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Rating
          </Typography>
          <Controller
            control={control}
            name="rating"
            render={({ field }) => (
              <StarRating
                value={field.value || 0}
                onChange={field.onChange}
                readOnly={false}
                showValue={false}
                precision={1}
              />
            )}
          />
          {errors.rating && (
            <Typography variant="caption" color="error">
              {errors.rating.message}
            </Typography>
          )}
        </Box>

        <TextField
          label="Comment"
          placeholder="Share what stood out to you about this book"
          multiline
          rows={5}
          fullWidth
          {...register('comment')}
          error={!!errors.comment}
          helperText={errors.comment?.message ?? 'Optional. Max 1000 characters.'}
          disabled={isSubmitting}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {onCancel && (
            <Button onClick={onCancel} disabled={isSubmitting} variant="outlined">
              Cancel
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={18} /> : undefined}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
