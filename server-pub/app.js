// app.js
const express = require('express');
const amqp = require('amqplib');
const app = express();
const PORT = 5000;
const { v4 } = require('uuid');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
let rabbitMQConnection;
const queueName = "MessageQueue";

const products = [
    { id: 1, name: 'Product 1', description: 'description for Product 1', price: 10 },
    { id: 2, name: 'Product 2', description: 'description for Product 2', price: 30 },
    { id: 3, name: 'Product 3', description: 'description for Product 3', price: 20 }
];


app.post('/messages', async (req, res) => {
    try {
  
      if (!req.body?.message) {
        return res.status(400).json({
          detail: "The message property is required"
        });
      }
  
      const message = {
        id: v4(),
        message: req.body.JSON.stringify(products),
        date: new Date(),
      };
  
      const channel = await rabbitMQConnection.createChannel();
      await channel.assertQueue(queueName, { durable: false });
      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
      console.log(`Publishing an Event using RabbitMQ to :${req.body.JSON.stringify(products)}`);
      await channel.close();
      return res.json({
        detail: 'Publishing an Event using RabbitMQ successful',
      });
    } catch (error) {
      return res.status(500).json({
        detail: error.message
      });
    }
  });
  
  amqp.connect('amqp://localhost').then(connection => {
    rabbitMQConnection = connection;
    app.listen(PORT, () => {
      console.log(` server on port ${PORT}  `);
    });
  });