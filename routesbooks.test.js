

const request = require("supertest");

const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

const book = {
    "isbn": "0123456789",
    "amazon_url": "http://a.co/eobPtX2",
    "author": "Mike Smith",
    "language": "english",
    "pages": 230,
    "publisher": "Penguin Press",
    "title": "Reading Lolita in Tehran Part Two",
    "year": 1999
};


describe("Books Routes Test", function () {

    beforeEach(async function () {
        await db.query("DELETE FROM books");

        let b1 = await Book.creare(book);
    });

    /** GET /books => {books: [book, ...]} */
    describe("GET /books", function () {
        test("can view list", async function () {
           let response = await request(app)
             .get("/books");
             
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                books: [
                    book
                ]
            });
        });
    });


    /** GET /books/[id] => {book: book} */
    describe("GET /books/[id]", function () {
        test("can view book", async function () {
            let response = await request(app)
              .get("/books/" + book.isbn);
              
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                book
            });
        });


        test("cannot view book", async function () {
            let response = await request(app)
              .get("/books/test");
              
            expect(response.status).toBe(404);
        });
    });


    /**POST /  bookData => {book: newBook} */
    describe("POST /books", function () {
        test("can create book", async function () {
            const book1 = {
                "isbn": "000000",
                "amazon_url": "http://a.co/test",
                "author": "Test author",
                "language": "english",
                "pages": 100,
                "publisher": "test publisher",
                "title": "Test",
                "year": 2018

            };
            let response = await request(app)
               .post("/books")
               .send(book1);
               
            expect(response.status).toBe(201);
            expect(response.body).toEqual({ book: book1 });
        });

        test("cannot create book", async function () {
            let response = await request(app)
               .post("/books")
               .send({
                "isbn": "",
                "amazon_url": "amazon url",
                "author": "Test author",
                "language": "english",
                "pages": 0,
                "publisher": "test publisher",
                "title": "Test",
                "year": 0
               });
               
               expect(response.status).toBe(400);
               expect(response.body.error.message).toContain("instance.isbn does not meet minimum length of 1");
               expect(response.body.error.message).toContain("instance.amazon_url does not conform to the \"uri\" format");
               expect(response.body.error.message).toContain("instance.pages must be greater than or equal to 1");
               expect(response.body.error.message).toContain("instance.year must be greater than or equal to 1");

               // duplicate isbn
               response = await request(app)
                 .post("/books")
                 .send(book);
                 
               expect(response.status).toBe(400);
               expect(response.body.error.message).toEqual("ISBN already exists"); 
        });
    });


    /** PUT /[isbn]  bookData => {book: updatedBook} */
    describe("PUT /books/[isbn]", function () {
        test("can update book", async function () {
            const book1 = {
               "amazon_url": "http://a.co/test",
               "author": "Test author",
               "language": "english",
               "pages": 100,
               "publisher": "Test publisher",
               "title": "Test",
               "year": 2019 
            };
            let response = await request(app)
               .put("/books/0987654321")
               .send(book1);
               
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                book: {
                   "isbn": "0987654321",
                   ...book1 
                }
            });
        });

        test("cannot create book", async function () {
            let response = await request(app)
               .put("/books/0987654321")
               .send({
                 "amazon_url": "amazon url",
                 "author": "Test author",
                 "language": "english",
                 "pages": 0,
                 "publisher": "test publisher",
                 "title": "Test",
                 "year": 0 

               });
               
            expect(response.status).toBe(400);
            expect(response.body.error.message).toContain("instance.amazon_url does not conform to the \"uri\" format");
            expect(response.body.error.message).toContain("instance.pages must be greater than or equal to 1");
            expect(response.body.error.message).toContain("instance.year must be greater than or equal to 1");

            // cannot find isbn
            response = await request(app)
               .put("/books/test")
               .send(book);
            
            expect(response.status).toBe(404);
        });
    });
});

afterAll(async function () {
    await db.end();
});