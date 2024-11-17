"use client";

import { useState, useEffect } from "react";

type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  imageUrl?: string;
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [error, setError] = useState<string>("");
  const [newBook, setNewBook] = useState<Book>({
    id: 0,
    title: "",
    author: "",
    price: 0,
    imageUrl: "",
  });
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then((data: Book[]) => setBooks(data))
      .catch((err) => {
        setError("Failed to load books");
        console.error(err);
      });
  }, []);

  const handleEdit = (book: Book) => {
    setEditingBook(book);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/books?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
      } else {
        console.error("Failed to delete book");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editingBook) return;

    const formData = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/books", {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const updatedBook = await response.json();
        setBooks((prevBooks) =>
          prevBooks.map((book) =>
            book.id === updatedBook.id ? updatedBook : book
          )
        );
        setEditingBook(null);
      } else {
        console.error("Failed to update book");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", newBook.title);
    formData.append("author", newBook.author);
    formData.append("price", newBook.price.toString());
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const addedBook = await response.json();
        setBooks((prevBooks) => [...prevBooks, addedBook]);
        setNewBook({
          id: 0,
          title: "",
          author: "",
          price: 0,
          imageUrl: "",
        });
        setImage(null);
      } else {
        console.error("Failed to add book");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-6 text-center text-white animate-pulse">
        Books Inventory
      </h1>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      {/* Add New Book Form */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-center text-white">
          Add New Book
        </h2>
        <form
          onSubmit={handleAddSubmit}
          className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto"
        >
          <div className="mb-4 text-black font-bold">
            <label className="block mb-1">Title</label>
            <input
              type="text"
              value={newBook.title}
              onChange={(e) =>
                setNewBook({ ...newBook, title: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4 text-black font-bold">
            <label className="block mb-1">Author</label>
            <input
              type="text"
              value={newBook.author}
              onChange={(e) =>
                setNewBook({ ...newBook, author: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4 text-black font-bold">
            <label className="block mb-1">Price</label>
            <input
              type="number"
              value={newBook.price}
              onChange={(e) =>
                setNewBook({ ...newBook, price: parseFloat(e.target.value) })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4 text-black font-bold">
            <label className="block mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Book
          </button>
        </form>
      </div>

      {/* Available Books */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-center text-white">
          Available Books
        </h2>
        {books.length === 0 ? (
          <p className="text-center text-white animate-bounce">
            No books available
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {books.map((book) => (
              <li
                key={book.id}
                className="p-4 bg-white text-gray-800 rounded-lg shadow-lg transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
              >
                {book.imageUrl && (
                  <div className="relative w-full h-40 bg-gray-200 rounded mb-2 overflow-hidden">
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="absolute top-0 left-0 w-full h-full object-contain"
                    />
                  </div>
                )}
                <div>
                  <p className="font-bold text-lg">{book.title}</p>
                  <p>By {book.author}</p>
                  <p className="text-purple-600 font-semibold">
                    ${book.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEdit(book)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Edit Book Modal */}
      {editingBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <form
            className="bg-white p-6 rounded-lg shadow-lg"
            onSubmit={handleEditSubmit}
          >
            <h3 className="text-xl font-semibold mb-4 text-black">Edit Book</h3>
            <input type="hidden" name="id" value={editingBook.id} />
            <div className="mb-4">
              <label className="block mb-1">Title</label>
              <input
                type="text"
                name="title"
                defaultValue={editingBook.title}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Author</label>
              <input
                type="text"
                name="author"
                defaultValue={editingBook.author}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Price</label>
              <input
                type="number"
                name="price"
                defaultValue={editingBook.price}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setEditingBook(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
