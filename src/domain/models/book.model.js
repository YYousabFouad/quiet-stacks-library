export function createBookRecord(data, id = `book-${Date.now()}`) {
  return {
    id,
    title: data.title.trim(),
    author: data.author.trim(),
    category: data.category.toLowerCase(),
    categoryLabel: data.categoryLabel || data.category,
    isbn: data.isbn ? data.isbn.trim() : 'N/A',
    year: data.year ? parseInt(data.year, 10) : new Date().getFullYear(),
    price: data.price ? parseFloat(data.price) : 19.99,
    status: data.status || 'available'
  };
}
