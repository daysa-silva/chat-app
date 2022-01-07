const socket = io()

// Elements
const $sidebar = document.querySelector('#sidebar')

const $messages = document.querySelector('#messages')

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $LocationButton = document.querySelector('#share-location')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const linkMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

function autoscroll() {
    const $newMessage = $messages.lastElementChild

    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = containerHeight //$messages.scrollHeight
    }
}

socket.on('printMessage', (msg) => {
    const html = Mustache.render(messageTemplate, {
        name: msg.name,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

    //const newMessage = document.importNode(messageTemplate,true).firstElementChild
    //$messages.insertAdjacentElement('beforeend', newMessage )
    //console.log(newMessage)
})

socket.on('printLink', (obj) => {
    const html = Mustache.render(linkMessageTemplate, {
        name: obj.name,
        text: obj.text,
        link: obj.link,
        createdAt: moment(obj.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room, users
    })
    $sidebar.insertAdjacentHTML('afterbegin', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    //disable
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        //enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) 
            console.log(error)
        else
            console.log('Message delivered!')
    })
})

$LocationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $LocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', { 
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude
        }, () => {
            console.log('Location shared!')
            $LocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) alert(error)
})