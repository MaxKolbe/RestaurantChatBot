const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)
require("dotenv").config()
const PORT = 3000 || process.env.PORT

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html")
})

var orders = {}

//Chatbot options
const options = [
  ' Select 1 to Place an order',
  ' Select 99 to checkout order',
  ' Select 98 to see order history',
  ' Select 97 to see current order',
  ' Select 0 to cancel order',
]

//Items on menu
const items = ['Beef', 'Chicken', 'Goat']

// Send options to the user on connection
io.on('connection', (socket) => {
  // console.log('New user connected')
  socket.emit('output', options)

  // Handle user input
socket.on('input', (data) => {
  console.log('User input:', data)

  switch (data) {
    case '1':
      // Send list of items to the user
      socket.emit('output', items.toString().replaceAll(",", " , "))
      break;
    case '99':
      // Checkout order
      if (Object.keys(orders).length) {
        socket.emit('output', 'Order placed')
        orders = {};
      } else { 
        socket.emit('output', 'No order to place')
      }
      break;
    case '98':
      // Get order history
      const history = Object.values(orders)
      if (history.length) {
        socket.emit('output', history.toString().replaceAll(",", " , "))
      } else {
        socket.emit('output', 'No order history')
      }
      break;
    case '97':
      // Get current order
      const currentOrder = Object.values(orders).slice(-1)[0]
      if (currentOrder) {
        socket.emit('output', currentOrder)
      } else {
        socket.emit('output', 'No current order')
      }
      break;
    case '0':
      // Cancel order
      if (Object.keys(orders).length) {
        delete orders[socket.id]
        socket.emit('output', 'Order cancelled')
      } else {
        socket.emit('output', 'No order to cancel')
      }
      break;
    default:
      //Add Item to order
      if (items.includes(data)) {
        if (!orders[socket.id]) {
          orders[socket.id] = []
        }
        orders[socket.id].push(data);
        socket.emit('output', `Added ${data} to order`)
      } else {
        socket.emit('output', `Please select a valid option`)
      }
      break;
}
  }) 
    })
    
server.listen(PORT, () => {
  console.log('listening on *:3000')
})
