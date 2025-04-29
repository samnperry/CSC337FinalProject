function storeUser(){
    var username = document.getElementById('username').value
    window.localStorage.setItem('username', username)
}
function createUser(event) {
    event.preventDefault()

    var username = document.getElementById('username').value
    var email = document.getElementById('email').value
    var password = document.getElementById('password').value

    fetch('/register', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ username, email, password })
    })
    .then(function(res) {
        return res.text()
    })
    .then(function(text) {
        document.open()
        document.write(text)
        document.close()
    })
    .catch(function(err) {
        console.log(err)
    })
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
            
            for (var i = 0; i < books.length; i++) {
                var book = books[i]

                var bookItem = document.createElement('div')
                bookItem.innerHTML = `
                    <p><strong>${book.title}</strong> - <em>$${book.price}</em></p>
                    <button onclick="toggleEditForm('${book._id}', '${book.title}', ${book.price})">Edit</button>
                    <div id="edit-form-${book._id}" style="display: none; margin-top: 10px;"></div>
                `
                bookListElement.appendChild(bookItem)
            }
        })
        .catch(function(error) {
            console.error('Error loading books:', error)
            document.querySelector('.book-list').innerHTML = '<p>Error loading books. Please try again later.</p>'
        })
}

function toggleEditForm(id, title, price) {
    var formDiv = document.getElementById(`edit-form-${id}`)

    if (formDiv.innerHTML === '' || formDiv.style.display === 'none') {
        formDiv.style.display = 'block'
        formDiv.innerHTML = `
            <form onsubmit="submitEdit(event, '${id}')">
                <label>Title: <input name="title" value="${title}" /></label><br>
                <label>Price: <input name="price" type="number" value="${price}"/></label><br>
                <button type="submit">Save</button>
            </form>
        `
    } else {
        formDiv.style.display = 'none'
    }
}

function submitEdit(event, id) {
    event.preventDefault()
    var form = event.target
    var updatedBook = {
        title: form.title.value,
        price: parseFloat(form.price.value)
    }

    fetch(`/books/${id}`, {
        method: 'PUT',
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



