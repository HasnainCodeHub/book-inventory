import { NextRequest } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  imageUrl?: string;
}

// In-memory book list with two default books
let books: Book[] = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    price: 10.99,
    imageUrl: "https://media.glamour.com/photos/56e1f3c462b398fa64cbd304/master/w_1600%2Cc_limit/entertainment-2016-02-18-main.jpg",
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    price: 8.99,
    imageUrl: "https://m.media-amazon.com/images/I/91O8Zn2YZUL._AC_UF894,1000_QL80_.jpg",
  },
];

const uploadDir = join(process.cwd(), "public", "uploads");

export async function GET(): Promise<Response> {
  return new Response(JSON.stringify(books), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const price = parseFloat(formData.get("price") as string);
    const image = formData.get("image") as File;

    if (!title || !author || isNaN(price)) {
      return new Response(JSON.stringify({ error: "Invalid book data" }), {
        status: 400,
      });
    }

    let imageUrl = "";
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${image.name}`;
      const filepath = join(uploadDir, filename);

      // Ensure the upload directory exists
      await mkdir(uploadDir, { recursive: true });
      await writeFile(filepath, buffer);

      imageUrl = `/uploads/${filename}`;
    }

    const newBook: Book = {
      id: Date.now(),
      title,
      author,
      price,
      imageUrl,
    };

    books.push(newBook); // Add to the list

    return new Response(JSON.stringify(newBook), { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return new Response(JSON.stringify({ error: "Failed to add book" }), {
      status: 500,
    });
  }
}

export async function PUT(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const id = parseInt(formData.get("id") as string);
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const price = parseFloat(formData.get("price") as string);
    const image = formData.get("image") as File | null;

    const bookIndex = books.findIndex((book) => book.id === id);
    if (bookIndex === -1) {
      return new Response(
        JSON.stringify({ error: "Book not found" }),
        { status: 404 }
      );
    }

    let imageUrl = books[bookIndex].imageUrl; // Retain the old image by default
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${image.name}`;
      const filepath = join(uploadDir, filename);

      // Ensure the upload directory exists
      await mkdir(uploadDir, { recursive: true });
      await writeFile(filepath, buffer);

      imageUrl = `/uploads/${filename}`;
    }

    books[bookIndex] = {
      ...books[bookIndex],
      title,
      author,
      price,
      imageUrl,
    };

    return new Response(JSON.stringify(books[bookIndex]), { status: 200 });
  } catch (error) {
    console.error("PUT error:", error);
    return new Response(JSON.stringify({ error: "Failed to update book" }), {
      status: 500,
    });
  }
}

// DELETE method to remove a book by id
export async function DELETE(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") as string);

    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: "Invalid ID" }), { status: 400 });
    }

    const bookIndex = books.findIndex((book) => book.id === id);
    if (bookIndex === -1) {
      return new Response(JSON.stringify({ error: "Book not found" }), {
        status: 404,
      });
    }

    books = books.filter((book) => book.id !== id); // Remove the book
    return new Response(JSON.stringify({ message: "Book deleted successfully" }), {
      status: 200,
    });
  } catch (error) {
    console.error("DELETE error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete book" }), {
      status: 500,
    });
  }
}
  