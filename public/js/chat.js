//client side
const socket  =  io()
//Element from html doc 
const $messageForm = document.querySelector('#mf')
const $messageformInput = document.querySelector('input')
const $messageformButton = document.querySelector('button')
const $sendLoactionButton = document.querySelector('#send-loaction')
const $messages = document.querySelector('#messages')

//create templates using Mustache lib present in chat.html
const messageTemplate = document.querySelector('#message-template').innerHTML
const loactionTemplate = document.querySelector('#loaction-template').innerHTML
const sidebarTemplete = document.querySelector('#sidebar-template').innerHTML

//create Option using qs stand for query String lib present in chat.html 
//qs return Object
const {username,room} = Qs.parse(location.search , {ignoreQueryPrefix : true})

const autoscroll = ()=>{
    //New message element 
    const $newMessage = $messages.lastElementChild

    //Height of new message 
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.scrollHeight

    //Height of message container
    const containerHight = $messages.scrollHeight

    //How far have i scrolled?
    const scrolledoffset = $messages.scrollTop + visibleHeight

    if(Math.round(containerHight - newMessageHeight) <= Math.round(scrolledoffset))
    {
        $messages.scrollTop = $messages.scrollHeight
    }
}


// server(emit) -> client(receive)--acknowledgement-->server
// client (emit) -> server(receive)--acknowledgement-->client
//send message
socket.on('message',(data)=>{
    console.log(data)
    const html =Mustache.render(messageTemplate,{
        username:data.username,
        message:data.text,
        createdAt :moment(data.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html) 
    autoscroll()
})

// location send to client
socket.on('loactionMessage',(loaction)=>{
    console.log(loaction)
    const html = Mustache.render(loactionTemplate,{
        username:loaction.username,
        location:loaction.location,
        createdAt:moment(loaction.createdAt).format('h:mm a ')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

//all memeber list who join the same room
socket.on('roomData',({room,users})=>{
const html = Mustache.render(sidebarTemplete,{
    room,
    users
})
document.querySelector('#sidebar').innerHTML = html
})
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //Disable a button after a send message 
    $messageformButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage' , message,(error)=>{
        if(error){
            return console.log(error)
        }
        //enable after disable 
        $messageformButton.removeAttribute('disabled')
        $messageformInput.value = ''
        $messageformInput.focus()

        console.log('Message Delivered')
    })
})
//define loaction
$sendLoactionButton.addEventListener('click',()=>{
    if(! navigator.geolocation){
        return alert('geoloaction is not supported by your browser')
    }
    $sendLoactionButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((GeolocationPosition)=>{
        socket.emit('sendLocation',{
            latitude:GeolocationPosition.coords.latitude,
            longitude:GeolocationPosition.coords.longitude
    },()=>{
        $sendLoactionButton.removeAttribute('disabled')
        console.log('Location Shared')
    })
    })
})

//join a person in a specific Room 
socket.emit('join',{username, room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})