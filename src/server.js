const http = require('http');
// const url = require('url');
const { nanoid } = require('nanoid');

const books = [];

const server = http.createServer((req, res) => {
  const { method, url: reqUrl } = req;

  if (method === 'GET' && reqUrl === '/books') {
    // Menampilkan seluruh buku
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'success',
      data: {
        books: books.map(({ id, name, publisher }) => ({ id, name, publisher })),
      },
    }));
  } else if (method === 'POST' && reqUrl === '/books') {
    // Menyimpan buku
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const {
          name, year, author, summary, publisher, pageCount, readPage, reading,
        } = data;

        if (!name) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
          }));
        } else if (readPage > pageCount) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
          }));
        } else {
          const id = nanoid();
          const finished = pageCount === readPage;
          const insertedAt = new Date().toISOString();
          const updatedAt = insertedAt;

          const newBook = {
            id, name, year, author, summary, publisher, pageCount, readPage, reading, finished, insertedAt, updatedAt,
          };

          books.push(newBook);

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
              bookId: id,
            },
          }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'fail',
          message: 'Gagal menambahkan buku. Format JSON tidak valid',
        }));
      }
    });
  } else if (method === 'GET' && reqUrl.startsWith('/books/')) {
    // Menampilkan detail buku
    const bookId = reqUrl.split('/books/')[1];
    const book = books.find((b) => b.id === bookId);

    if (book) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'success',
        data: {
          book,
        },
      }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'fail',
        message: 'Buku tidak ditemukan',
      }));
    }
  } else if (method === 'PUT' && reqUrl.startsWith('/books/')) {
    // Mengubah data buku
    const bookId = reqUrl.split('/books/')[1];
    const bookIndex = books.findIndex((b) => b.id === bookId);

    if (bookIndex !== -1) {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const { name, pageCount, readPage } = data;

          if (!name) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: 'fail',
              message: 'Gagal memperbarui buku. Mohon isi nama buku',
            }));
          } else if (readPage > pageCount) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: 'fail',
              message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
            }));
          } else {
            books[bookIndex] = {
              ...books[bookIndex],
              ...data,
              finished: pageCount === readPage,
              updatedAt: new Date().toISOString(),
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: 'success',
              message: 'Buku berhasil diperbarui',
            }));
          }
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'fail',
            message: 'Gagal memperbarui buku. Format JSON tidak valid',
          }));
        }
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
      }));
    }
  } else if (method === 'DELETE' && reqUrl.startsWith('/books/')) {
    // Menghapus buku
    const bookId = reqUrl.split('/books/')[1];
    const bookIndex = books.findIndex((b) => b.id === bookId);

    if (bookIndex !== -1) {
      books.splice(bookIndex, 1);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'success',
        message: 'Buku berhasil dihapus',
      }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
      }));
    }
  } else {
    // Route tidak ditemukan
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'fail',
      message: 'Route tidak ditemukan',
    }));
  }
});

const port = 9000;
server.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
