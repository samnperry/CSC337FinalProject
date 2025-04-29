var express = require('express')
var crypto = require('crypto')
var path = require('path')
var { MongoClient } = require('mongodb')

var app = express()

var client = new MongoClient('mongodb+srv://samnperry:SH2BsUgpJC3984ro@csc337cluster.l97k3ff.mongodb.net/')

function insertPromise(collectionName, doc) {
    return client.connect()
        .then(function () {
            var db = client.db('CSCDatabase')
            var coll = db.collection(collectionName)
            return coll.insertOne(doc)
        })
        .finally(function () {
            client.close()
        })
}

function findPromise(collectionName, search) {
    return new Promise(function (resolve, reject) {
        client.connect()
            .then(function () {
                var db = client.db('CSCDatabase')
                var coll = db.collection(collectionName)
                return coll.find(search).toArray()
            })
            .then(function (docs) {
                resolve(docs)
            })
            .catch(function (err) {
                console.log(err)
                reject(err)
            })
            .finally(function () {
                client.close()
            })
    })
}


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
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

app.get('/styles.css', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend', 'styles.css'))
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
    findPromise('users', { username, password: hashPassword(password) })
    .then(function (users) {
        if (users.length > 0) {
            var user = users[0]
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
    })
    .catch(function (err) {
        console.error('Error during login:', err)
        res.redirect('/login.html')
    })

})

app.post('/register', async function(req, res) {
    var { username, email, password } = req.body
    console.log(`New user registration attempt: ${username} (${email})`)

    findPromise('users', { username })
    .then(function (users) {
        if (users.length > 0) {
            console.log('Username already exists.')
            res.redirect('/create_account.html')
        } else {
            var hashedPass = hashPassword(password)
            insertPromise('users', {
                username,
                email,
                password: hashedPass,
                usertype: 'user'
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

    insertPromise('orders', {
        book,
        quantity: parseInt(quantity),
        orderDate: new Date()
    })
    .then(function () {
        console.log('Order saved to database.')
        res.redirect('/home.html')
    })
    .catch(function (error) {
        console.error('Error saving order:', error)
        res.redirect('/order.html')
    })
    
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

app.get('/logout', function(req, res) {
    res.redirect('/')
})

app.listen(8080, function() {
    console.log('Server started on http://localhost:8080');
})
