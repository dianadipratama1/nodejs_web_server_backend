const http = require('http');
const url = require('url');
const nanoid = require('nanoid');

const port = 9000;

let books = [];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'GET' && parsedUrl.pathname === '/books') {
    // Kriteria 4: API dapat menampilkan seluruh buku
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'success', data: { books } }));
  } else if (req.method === 'GET' && parsedUrl.pathname === '/books/:bookId') {
    // Kriteria 5: API dapat menampilkan detail buku
    const bookId = parsedUrl.pathname.split('/')[2];
    const book = books.find(b => b.id === bookId);

    if (!book) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'fail', message: 'Buku tidak ditemukan' }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'success', data: { book } }));
    }
  } else if (req.method === 'POST' && parsedUrl.pathname === '/books') {
    // Kriteria 3: API dapat menyimpan buku
    let requestBody = '';

    req.on('data', (chunk) => {
      requestBody += chunk;
    });

    req.on('end', () => {
      const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading
      } = JSON.parse(requestBody);

      if (!name) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'fail', message: 'Gagal menambahkan buku. Mohon isi nama buku' }));
      } else if (readPage > pageCount) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'fail', message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount' }));
      } else {
        const id = nanoid();
        const finished = pageCount === readPage;
        const insertedAt = new Date().toISOString();
        const updatedAt = insertedAt;

        const newBook = {
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading
        };

        books.push(newBook);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', message: 'Buku berhasil ditambahkan', data: { bookId: id } }));
      }
    });
  } else {
    // Handle other routes or methods
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'fail', message: 'Endpoint tidak ditemukan' }));
  }
});

// Kriteria 1: Aplikasi menggunakan port 9000
// Kriteria 2: Aplikasi dijalankan dengan perintah npm run start
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
