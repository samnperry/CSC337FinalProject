var express = require('express')
var crypto = require('crypto')
var path = require('path')
var { MongoClient, ObjectId } = require('mongodb')

var app = express()

var client = new MongoClient('mongodb+srv://samnperry:SH2BsUgpJC3984ro@csc337cluster.l97k3ff.mongodb.net/')

function insertPromise(collectionName, doc) {
    var localClient = new MongoClient('mongodb+srv://samnperry:SH2BsUgpJC3984ro@csc337cluster.l97k3ff.mongodb.net/')
    return localClient.connect()
        .then(function () {
            var db = localClient.db('CSCDatabase')
            var coll = db.collection(collectionName)
            return coll.insertOne(doc)
        })
        .finally(function () {
            localClient.close()
        })
}

function findPromise(collectionName, search) {
    var localClient = new MongoClient('mongodb+srv://samnperry:SH2BsUgpJC3984ro@csc337cluster.l97k3ff.mongodb.net/')
    return localClient.connect()
        .then(function () {
            var db = localClient.db('CSCDatabase')
            var coll = db.collection(collectionName)
            return coll.find(search).toArray()
        })
        .finally(function () {
            localClient.close()
        })
}


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function isAdmin(user) {
    return user && user.usertype == 'admin'
}

app.use(express.static(path.join(__dirname, 'frontend')))

app.get('/home', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'home.html'))
})

app.post('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'home.html'))
})

app.post('/source', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'source.js'))
})

app.get('/style.css', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'styles.css'))
})

app.post('/home', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'home.html'))
})

app.post('/products', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'product.html'))
})

app.post('/order', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'order.html'))
})

app.post('/login', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'))
})

app.post('/create_account', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'create_account.html'))
})

app.post('/admin', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'admin.html'))
})

app.post('/add_book', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'add_book.html'))
})

app.post('/lgn_action', async function(req, res) {
    var { username, password } = req.body;
    console.log(`Login attempt by: ${username}`)

    try {
        var users = await findPromise('users', {
            username,
            password: hashPassword(password)
        })

        if (users.length > 0) {
            const user = users[0]
            console.log(`Login successful for: ${username}`)
            if (isAdmin(user)) {
                res.redirect('/admin.html')
            } else {
                res.redirect('/home.html')
            }
        } else {
            console.log(`Login failed for: ${username}`)
            res.redirect('/login.html')
        }
    } catch (err) {
        console.error('Error during login:', err)
        res.redirect('/login.html')
    }
})

app.post('/check-user-role', async function(req, res) {
    var { username } = req.body
    console.log('Checking user role for:', username)
    
    try {
        var users = await findPromise('users', { username })
        console.log('Users found:', users)
        
        if (users.length > 0) {
            res.json({ usertype: users[0].usertype })
        } else {
            console.log('User not found')
            res.json({ usertype: 'user' })
        }
    } catch (err) {
        console.error('Error fetching user:', err)
    }
})

app.post('/register', async function(req, res) {
    var { username, email, password, usertype } = req.body
    console.log(`New user registration: ${username} (${email}), Type: ${usertype}`)

    findPromise('users', { username })
    .then(function (users) {
        if (users.length > 0) {
            console.log('Username already exists.')
            res.redirect('/create_account.html')
        } else {
            var hashedPass = hashPassword(password)
            if (!usertype){
                usertype == 'user'
            }
            insertPromise('users', {
                username,
                email,
                password: hashedPass,
                usertype: usertype
            })
            .then(function () {
                console.log('User registered successfully.')
                res.redirect('/login.html')
            })
        }
    })
    .catch(function (err) {
        console.error('Error during registration:', err)
        res.redirect('/create_account.html')
    })
})

app.post('/submit-order', async function(req, res) {
    var { book, quantity } = req.body
    console.log(`Order received: ${book} (Quantity: ${quantity})`)

    try {
        var books = await findPromise('books', { title: book })
        if (books.length === 0) {
            console.log('Book not found.')
            res.redirect('/order.html')
            return
        }

        var bookToUpdate = books[0]

        if (bookToUpdate.stock < quantity) {
            console.log('Not enough stock available.')
            res.redirect('/order.html')
            return
        }

        var updatedStock = bookToUpdate.stock - quantity

        await insertPromise('orders', {
            book,
            quantity: parseInt(quantity),
            orderDate: new Date()
        })

        var localClient = new MongoClient('mongodb+srv://samnperry:SH2BsUgpJC3984ro@csc337cluster.l97k3ff.mongodb.net/')
        await localClient.connect()
        const db = localClient.db('CSCDatabase')
        await db.collection('books').updateOne(
            { _id: bookToUpdate._id },
            { $set: { stock: updatedStock } }
        )

        console.log('Order saved to database and stock updated.')
        res.redirect('/home.html')
    } catch (error) {
        console.error('Error processing order:', error)
        res.redirect('/order.html')
    }
})

app.get('/books', async function(req, res) {
    findPromise('books', {})
    .then(function (books) {
        res.json(books)
    })
    .catch(function (error) {
        console.error('Error fetching books:', error)
        res.status(500).send('Error fetching books')
    })

})

app.post('/add-book', function(req, res) {
    var { title, author, price, description, stock } = req.body
    console.log(`Adding new book: ${title} by ${author}`)

    insertPromise('books', {
        title,
        author,
        price: parseFloat(price),
        description,
        stock: parseInt(stock)
    })
    .then(function () {
        console.log('Book added successfully.')
        res.redirect('/admin.html')
    })
    .catch(function (error) {
        console.error('Error adding book:', error)
    })
})

app.post('/edit-book', function(req, res) {
    const { id, title, author, price, description, stock } = req.body
    const updatedBook = {
        title,
        author,
        price: parseFloat(price),
        description,
        stock: parseInt(stock)
    }

    var localClient = new MongoClient('mongodb+srv://samnperry:SH2BsUgpJC3984ro@csc337cluster.l97k3ff.mongodb.net/')
    localClient.connect()
        .then(function () {
            const db = localClient.db('CSCDatabase');
            return db.collection('books')
                     .updateOne({ _id: new ObjectId(id) }, { $set: updatedBook })
        })
        .then(function () {
            console.log(`Book with ID ${id} updated.`)
            res.json({ message: `Book with ID ${id} updated.` })
        })
        .catch(function (err) {
            console.error('Error updating book:', err)
            res.redirect('/admin.html')
        })
        .finally(function () {
            localClient.close()
        })
})



app.get('/logout', function(req, res) {
    res.redirect('/')
})

app.listen(8080, function() {
    console.log('Server started on http://localhost:8080');
})
