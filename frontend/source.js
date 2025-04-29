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
                var bookItem = document.createElement('p')
                bookItem.innerHTML = `${book.title} - <em>$${book.price}</em>`
                bookListElement.appendChild(bookItem)
            }
        })
        .catch(function(error) {
            console.error('Error loading books:', error)
            document.querySelector('.book-list').innerHTML = '<p>Error loading books. Please try again later.</p>'
        })
}


