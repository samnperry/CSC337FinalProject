function storeUser(){
    var username = document.getElementById('username').value
    window.localStorage.setItem('username', username)
}

function initPage() {
    fetchBooks()
    updateNavbar()
}

function updateNavbar() {
    var username = window.localStorage.getItem('username');


    if (username != null) {
        fetch('/check-user-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username })
        })
        .then(function(response){
            return response.json()
        })
        .then(function(data){
            var navbar = document.getElementById('navbar')
            window.localStorage.setItem('usertype', data.usertype)
            
            if (data.usertype === 'admin') {
                navbar.innerHTML = `
                    <a onclick="sendReq('/admin')">Home</a>
                    <a onclick="sendReq('/products')">Books</a>
                    <a onclick="sendReq('/order')">Order</a>
                    <a onclick="sendReq('/login')">Login</a>
                    <a onclick="sendReq('/add_book')">Manage Inventory</a>
                `
            } else {
                navbar.innerHTML = `
                    <a onclick="sendReq('/home')">Home</a>
                    <a onclick="sendReq('/products')">Books</a>
                    <a onclick="sendReq('/order')">Order</a>
                    <a onclick="sendReq('/login')">Login</a>
                    <a onclick="sendReq('/create_account')">Create Account</a>
                `
            }
        })
        .catch(function(err) {
            console.log('Error checking user role:', err)
            document.getElementById('navbar').innerHTML = `
                <a onclick="sendReq('/home')">Home</a>
                <a onclick="sendReq('/products')">Books</a>
                <a onclick="sendReq('/order')">Order</a>
                <a onclick="sendReq('/login')">Login</a>
                <a onclick="sendReq('/create_account')">Create Account</a>
            `
        })
    } else {
        document.getElementById('navbar').innerHTML = `
            <a onclick="sendReq('/home')">Home</a>
            <a onclick="sendReq('/products')">Books</a>
            <a onclick="sendReq('/order')">Order</a>
            <a onclick="sendReq('/login')">Login</a>
            <a onclick="sendReq('/create_account')">Create Account</a>
        `
    }
}

function sendReq(url){
    var username = window.localStorage.getItem('username')
    var body = {}
    if(username!=null){
        body = {'username':username}
    }
    fetch(url, {
        'headers': {'Content-Type': 'application/json'},
        'method': 'POST',
        'body': JSON.stringify(body)
    })
    .then(function(res){
        return res.text()
    })
    .then(function(text){
        document.open()
        document.write(text)
        document.close()
    })
    .catch(function(err){
        console.log(err)
    })
}

function toggleTheme() {
    var body = document.getElementsByTagName('body')[0]
    var theme = window.localStorage.getItem('theme')

    if (theme == null || theme === 'black') {
        body.style['background-color'] = 'white'
        body.style['color'] = 'black'
        window.localStorage.setItem('theme', 'white')
    } else {
        body.style['background-color'] = 'black'
        body.style['color'] = 'white'
        window.localStorage.setItem('theme', 'black')
    }
}

function applySavedTheme() {
    var body = document.getElementsByTagName('body')[0]
    var theme = window.localStorage.getItem('theme')

    if (theme == null || theme === 'black') {
        body.style['background-color'] = 'black'
        body.style['color'] = 'white'
        window.localStorage.setItem('theme', 'black')
    } else {
        body.style['background-color'] = 'white'
        body.style['color'] = 'black'
        window.localStorage.setItem('theme', 'white')
    }
}

function fetchBooks() {
    fetch('/books')
        .then(function(res) {
            return res.json()
        })
        .then(function(books) {
            var bookListElement = document.getElementById('book-list')
            
            if (books.length === 0) {
                bookListElement.innerHTML = "<p>No books available.</p>"
                return
            }

            bookListElement.innerHTML = ''
            var usertype = window.localStorage.getItem('usertype')
            
            for (var i = 0; i < books.length; i++) {
                var book = books[i]
                var bookItem = document.createElement('div')

                var content = `
                    <p><strong>Title:</strong> ${book.title}</p>
                    <p><strong>Author:</strong> ${book.author}</p>
                    <p><strong>Price:</strong> $${book.price}</p>
                    <p><strong>Description:</strong> ${book.description}</p>
                    <p><strong>Stock:</strong> ${book.stock}</p>
                `

                if (usertype === 'admin') {
                    content += `
                        <button onclick="toggleEditForm('${book._id}', '${book.title}', '${book.author}', ${book.price}, '${book.description}', ${book.stock})">Edit</button>
                        <div id="edit-form-${book._id}" style="display: none; margin-top: 10px;"></div>
                    `
                }

                bookItem.innerHTML = content
                bookListElement.appendChild(bookItem)
            }
        })
        .catch(function(error) {
            console.error('Error loading books:', error)
            document.querySelector('.book-list').innerHTML = '<p>Error loading books. Please try again later.</p>'
        })
}

function toggleEditForm(id, title, author, price, description, stock) {
    var formDiv = document.getElementById(`edit-form-${id}`)

    if (formDiv.innerHTML === '' || formDiv.style.display === 'none') {
        formDiv.style.display = 'block'
        formDiv.innerHTML = `
            <form onsubmit="submitEdit(event, '${id}')">
                <label>Title: <input name="title" value="${title}" /></label><br>
                <label>Author: <input name="author" value="${author}" /></label><br>
                <label>Price: <input name="price" type="number" value="${price}" /></label><br>
                <label>Description: <input name="description" value="${description}" /></label><br>
                <label>Stock: <input name="stock" type="number" value="${stock}" /></label><br>
                <button type="submit">Save</button>
            </form>
        `
    } else {
        formDiv.style.display = 'none'
    }
}

function submitEdit(event, id) {
    event.preventDefault()
    var form = document.getElementById(`edit-form-${id}`).querySelector('form')

    var updatedBook = {
        id: id,
        title: form.title.value,
        author: form.author.value,
        price: parseFloat(form.price.value),
        description: form.description.value,
        stock: parseInt(form.stock.value)
    }

    fetch(`/edit-book`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedBook)
    })
    .then(function(res){
        return res.json()
    })
    .then(function(){
        fetchBooks()
    })
    .catch(function(err) {
        console.error('Error updating book:', err)
    })
}



