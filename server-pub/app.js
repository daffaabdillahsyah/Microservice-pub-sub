const express = require('express');
const app = express();
const { v4 } = require('uuid');
const PORT = 5000;
const amqp = require('amqplib');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
let rabbitMQConnection;
const queueName = "MessageQueue";

const products = [
    {id: 1, name: 'Apel', description: 'Apel merupakan merupakan jenis buah-buahan, biasanya berwarna merah.', price: 15000, rating: 4.5},
    {id: 2, name: 'Pepaya', description: 'Pepaya merupakan merupakan jenis buah-buahan, berwarna hijau.', price: 12000, rating: 4.5},
    {id: 3, name: 'Mangga', description: 'Mangga merupakan merupakan jenis buah-buahan, biasanya berwarna hijau.', price: 20000, rating: 4.5}
];

async function sendMessage(product) {
  try {
    const message = {
      id: v4(),
      product_id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      date: new Date(),
    };

    const channel = await rabbitMQConnection.createChannel();
    await channel.assertQueue(queueName, { durable: false });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
    console.log(`Publishing an Event using RabbitMQ for product: ${product.name}`);
    await channel.close();
  } catch (error) {
    console.error('Error publishing message:', error.message);
  }
}

async function startSendingMessages() {
  for (const product of products) {
    await sendMessage(product);
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before sending the next message
  }
}

app.post('/messages', async (req, res) => {});

amqp.connect('amqp://localhost').then(connection => {
  rabbitMQConnection = connection;
  startSendingMessages(); // Start sending messages for products
  app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
  });
});
