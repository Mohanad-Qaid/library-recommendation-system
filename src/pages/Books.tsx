import { useState, useEffect, useMemo } from 'react';
import { BookSearch } from '@/components/books/BookSearch';
import { BookGrid } from '@/components/books/BookGrid';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getBooks } from '@/services/api';
import { Book } from '@/types'; // Uses the interface you just provided
import { handleApiError } from '@/utils/errorHandling';

/**
 * Books page component with search, sorting by publishedYear, and pagination
 */
export function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('title');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Filtering Logic
  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;

    const query = searchQuery.toLowerCase();
    return books.filter(book =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.genre.toLowerCase().includes(query)
    );
  }, [books, searchQuery]);

  // 2. Sorting Logic - Corrected to use 'publishedYear'
  const sortedBooks = useMemo(() => {
    const sorted = [...filteredBooks];

    return sorted.sort((a, b) => {
      // Numerical sort for Rating
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      // Numerical sort for Year (using publishedYear from your interface)
      if (sortBy === 'publishedYear') {
        return (b.publishedYear || 0) - (a.publishedYear || 0);
      }

      // Alpha sort for Title/Author
      const key = sortBy as keyof Book;
      const valA = String(a[key] ?? '').toLowerCase();
      const valB = String(b[key] ?? '').toLowerCase();
      return valA.localeCompare(valB);
    });
  }, [filteredBooks, sortBy]);

  // 3. Pagination Logic
  const totalPages = Math.ceil(sortedBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedBooks.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedBooks, currentPage]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50">
      <div className="container mx-auto">

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            <span className="gradient-text">Book Catalog</span>
          </h1>
          <p className="text-slate-600 text-xl">
            Browse <span className="font-bold text-violet-600">{books.length}</span> amazing books
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <BookSearch onSearch={handleSearch} />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="glass-effect px-4 py-2 rounded-xl border border-white/20 shadow-sm bg-white/50">
            <p className="text-slate-700 font-semibold">
              Showing <span className="text-violet-600">{paginatedBooks.length}</span> of {filteredBooks.length}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-700 font-semibold">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="px-4 py-2.5 text-sm font-medium border rounded-lg bg-white focus:ring-2 focus:ring-violet-500 outline-none transition-all"
            >
              <option value="title">Title (A-Z)</option>
              <option value="author">Author (A-Z)</option>
              <option value="rating">Highest Rated</option>
              <option value="publishedYear">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* Book Grid */}
        {paginatedBooks.length > 0 ? (
          <BookGrid books={paginatedBooks} />
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">No matches found.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === page
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'bg-white border text-slate-600 hover:border-violet-400'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}