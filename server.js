var express = require('express')
var crypto = require('crypto')
var path = require('path')
var { MongoClient } = require('mongodb')

var app = express()

var client = new MongoClient('mongodb+srv://samnperry:SH2BsUgpJC3984ro@csc337cluster.l97k3ff.mongodb.net/')
var usersCollection;
var booksCollection;
var ordersCollection;

async function mongodbConnect() {
    try {
        await client.connect()
        console.log('Connected to MongoDB...')
        const db = client.db('CSCDatabase')
        usersCollection = db.collection('users')
        booksCollection = db.collection('books')
        ordersCollection = db.collection('orders')
    } catch (err) {
        console.error('MongoDB connection error:', err)
    }
}
mongodbConnect()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

async function checkLogin(username, password) {
    var hashedPass = hashPassword(password)
    var user = await usersCollection.findOne({ username: username, password: hashedPass })
    return user
}

function isAdmin(user) {
    return user && user.usertype === 'admin'
}

app.use(express.static(path.join(__dirname, 'frontend')))

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'home.html'))
})

app.get('/source.js', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'source.js'))
})

app.get('/home.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'home.html'))
})

app.get('/products.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'products.html'))
})

app.get('/order.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'order.html'))
})

app.get('/login.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'))
})

app.get('/create_account.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'create_account.html'))
})

app.get('/admin.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'admin.html'))
})

app.post('/login', async function(req, res) {
    var { username, password } = req.body
    console.log(`Login attempt by: ${username}`)
    try {
        var user = await checkLogin(username, password)
        if (user) {
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
    } catch (error) {
        console.error('Error during login:', error)
    }
})

app.post('/register', async function(req, res) {
    var { username, email, password } = req.body
    console.log(`New user registration attempt: ${username} (${email})`)

    try {
        var existingUser = await usersCollection.findOne({ username })
        if (existingUser) {
            console.log('Username already exists.')
            res.redirect('/create_account.html')
        } else {
            var hashedPass = hashPassword(password)
            await usersCollection.insertOne({
                username,
                email,
                password: hashedPass,
                usertype: 'user'
            })
            console.log('User registered successfully.')
            res.redirect('/login.html')
        }
    } catch (error) {
        console.error('Error during registration:', error)
    }
})

app.post('/submit-order', async function(req, res) {
    var { book, quantity } = req.body
    console.log(`Order received: ${book} (Quantity: ${quantity})`)

    try {
        await ordersCollection.insertOne({
            book,
            quantity: parseInt(quantity),
            orderDate: new Date()
        })
        console.log('Order saved to database.')
        res.redirect('/home.html')
    } catch (error) {
        console.error('Error saving order:', error)
    }
})

app.get('/books', async function(req, res) {
    try {
        var books = await booksCollection.find().toArray()
        res.json(books)
    } catch (error) {
        console.error('Error fetching books:', error)
    }
})

app.get('/logout', function(req, res) {
    res.redirect('/')
})

app.listen(8080, function() {
    console.log('Server started on http://localhost:8080');
})
