import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBook, useUpdateBook, useBook, useCategories } from '../hooks/useBooks';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const bookFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  author: z.string().min(1, 'Author is required').max(255),
  isbn: z.string().optional(),
  description: z.string().max(2000).optional(),
  publicationDate: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().int().min(1).default(1)
});

type BookFormValues = z.infer<typeof bookFormSchema>;

export const CreateEditBookPage = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: book, isLoading: bookLoading } = useBook(id || '');
  const { data: categories } = useCategories();
  const { mutate: createBook, isPending: isCreating } = useCreateBook();
  const { mutate: updateBook, isPending: isUpdating } = useUpdateBook();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: isEditMode && book ? book : { quantity: 1 }
  });

  if (isEditMode && bookLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const onSubmit = (data: BookFormValues) => {
    if (isEditMode && id) {
      updateBook(
        { id, data },
        {
          onSuccess: () => {
            navigate('/books');
          }
        }
      );
    } else {
      createBook(data, {
        onSuccess: () => {
          navigate('/books');
        }
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/books')}
        sx={{ mb: 2 }}
      >
        Back to Books
      </Button>

      <Card>
        <CardContent>
          <h2>{isEditMode ? 'Edit Book' : 'Add New Book'}</h2>

          <Stack
            component='form'
            spacing={3}
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 2 }}
          >
            <TextField
              label='Title'
              fullWidth
              error={!!errors.title}
              helperText={errors.title?.message}
              {...register('title')}
              disabled={isCreating || isUpdating}
            />

            <TextField
              label='Author'
              fullWidth
              error={!!errors.author}
              helperText={errors.author?.message}
              {...register('author')}
              disabled={isCreating || isUpdating}
            />

            <TextField
              label='ISBN'
              fullWidth
              error={!!errors.isbn}
              helperText={errors.isbn?.message}
              {...register('isbn')}
              disabled={isCreating || isUpdating}
            />

            <TextField
              label='Description'
              fullWidth
              multiline
              rows={4}
              error={!!errors.description}
              helperText={errors.description?.message}
              {...register('description')}
              disabled={isCreating || isUpdating}
            />

            <TextField
              label='Publication Date'
              type='date'
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.publicationDate}
              helperText={errors.publicationDate?.message}
              {...register('publicationDate')}
              disabled={isCreating || isUpdating}
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                {...register('category')}
                label='Category'
                disabled={isCreating || isUpdating}
              >
                <MenuItem value=''>Select Category</MenuItem>
                {categories?.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
                <MenuItem value='new'>+ Add New Category</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label='Quantity'
              type='number'
              fullWidth
              error={!!errors.quantity}
              helperText={errors.quantity?.message}
              {...register('quantity', { valueAsNumber: true })}
              disabled={isCreating || isUpdating || isEditMode}
              inputProps={{ min: 1 }}
            />

            <Stack direction='row' spacing={2} justifyContent='flex-end' sx={{ mt: 4 }}>
              <Button
                onClick={() => navigate('/books')}
                variant='outlined'
                disabled={isCreating || isUpdating}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                variant='contained'
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? 'Saving...' : isEditMode ? 'Update Book' : 'Create Book'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
