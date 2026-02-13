import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { Book, BookPricing } from '@/lib/types';
import { bookSchema } from '@/lib/validation';
import {
  getBooksAdmin,
  createBookAdmin,
  updateBookAdmin,
  deleteBookAdmin,
} from '@/services/adminBooksApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { BookForm } from './BookForm';

const defaultPricing: BookPricing[] = [
  { days: 7, price: 1.5, label: '1 Week' },
  { days: 14, price: 2.5, label: '2 Weeks' },
  { days: 30, price: 3.5, label: '1 Month' },
];

export default function ManageBooks() {
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    totalCopies: 1,
    copiesAvailable: 1,
    category: '',
    description: '',
    pricing: defaultPricing,
    price: 0,
  });

  const loadBooks = () => {
    getBooksAdmin()
      .then(setBooks)
      .catch(err =>
        toast({ title: 'Error', description: err.message, variant: 'destructive' })
      );
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const filteredBooks = books.filter(
    book =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validateForm = (): boolean => {
    const validation = bookSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        errors[err.path.join('.')] = err.message;
      });
      setFormErrors(errors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    await createBookAdmin(formData);
    toast({ title: 'Success', description: 'Book created successfully' });
    setIsCreateOpen(false);
    loadBooks();
  };

  const handleEdit = async () => {
    if (!selectedBook || !validateForm()) return;
    await updateBookAdmin(Number(selectedBook.id), formData);
    toast({ title: 'Success', description: 'Book updated successfully' });
    setIsEditOpen(false);
    loadBooks();
  };

  const handleDelete = async (id: number) => {
    await deleteBookAdmin(id);
    toast({ title: 'Deleted', description: 'Book removed' });
    loadBooks();
  };

  const openEditDialog = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      ...book,
      pricing: book.pricing || defaultPricing,
      price: book.pricing && book.pricing.length > 0 ? book.pricing[0].price : 0
    });
    setIsEditOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">Manage Books</h1>

          {/* Create Dialog */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setFormData({
                  title: '', author: '', isbn: '', totalCopies: 1, copiesAvailable: 1, category: '', description: '', pricing: defaultPricing, price: 0
                });
                setIsCreateOpen(true);
              }}><Plus className="mr-2 h-4 w-4" /> Add Book</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Book</DialogTitle>
              </DialogHeader>
              <BookForm
                formData={formData}
                setFormData={setFormData}
                errors={formErrors}
                onSubmit={handleCreate}
                submitLabel="Create Book"
              />
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Book</DialogTitle>
              </DialogHeader>
              <BookForm
                formData={formData}
                setFormData={setFormData}
                errors={formErrors}
                onSubmit={handleEdit}
                submitLabel="Update Book"
              />
            </DialogContent>
          </Dialog>
        </div>

        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />

        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map(book => (
                  <TableRow key={book.id}>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.copiesAvailable}</TableCell>
                    <TableCell>{book.totalCopies}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(book)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(Number(book.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
