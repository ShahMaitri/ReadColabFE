import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBook, useUpdateBook, useBook, useCategories } from '../hooks/useBooks';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect } from 'react';

const bookFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  author: z.string().min(1, 'Author is required').max(255),
  isbn: z.string().optional(),
  description: z.string().max(2000).optional(),
  publicationDate: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().int().min(1)
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
    control,
    formState: { errors },
    reset
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: '',
      author: '',
      isbn: '',
      description: '',
      publicationDate: '',
      category: '',
      quantity: 1
    }
  });

  useEffect(() => {
    if (isEditMode && book) {
      reset({
        title: book.title ?? '',
        author: book.author ?? '',
        isbn: book.isbn ?? '',
        description: book.description ?? '',
        publicationDate: book.publicationDate
          ? new Date(book.publicationDate).toISOString().slice(0, 10)
          : '',
        category: book.category ?? '',
        quantity: book.quantity ?? 1
      });
    }
  }, [isEditMode, book, reset]);

  if (isEditMode && bookLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const onSubmit = (data: BookFormValues) => {
    const normalizedData: BookFormValues = {
      ...data,
      isbn: data.isbn?.trim() || undefined,
      description: data.description?.trim() || undefined,
      category: data.category && data.category !== 'new' ? data.category.trim() : undefined,
      publicationDate: data.publicationDate
        ? new Date(`${data.publicationDate}T00:00:00.000Z`).toISOString()
        : undefined
    };

    if (isEditMode && id) {
      updateBook(
        { id, data: normalizedData },
        {
          onSuccess: () => {
            navigate('/books');
          }
        }
      );
    } else {
      createBook(normalizedData, {
        onSuccess: () => {
          navigate('/books');
        }
      });
    }
  };

  return (
    <Container maxWidth='md' sx={{ py: { xs: 2, md: 3 }, pb: { xs: 10, md: 6 } }}>
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

            <Controller
              name='publicationDate'
              control={control}
              render={({ field }) => (
                <TextField
                  label='Publication Date'
                  type='date'
                  fullWidth
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  inputRef={field.ref}
                  error={!!errors.publicationDate}
                  helperText={errors.publicationDate?.message}
                  disabled={isCreating || isUpdating}
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                />
              )}
            />

            <FormControl fullWidth error={!!errors.category}>
              <InputLabel>Category</InputLabel>
              <Controller
                name='category'
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value ?? ''}
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
                )}
              />
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
    </Container>
  );
};
