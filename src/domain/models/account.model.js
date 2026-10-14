export function createPurchaseRecord(book, now = new Date()) {
  return {
    bookId: book.id,
    title: book.title,
    author: book.author,
    price: book.price || 19.99,
    category: book.categoryLabel || book.category,
    purchaseDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`
  };
}
