const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "event-booking-app",
  brokers: ["localhost:9092"],
});

module.exports = kafka;
