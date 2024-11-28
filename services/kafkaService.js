const { Kafka } = require("kafkajs");
const kafka = new Kafka({
  clientId: "event-booking",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

exports.sendNotification = async (notification) => {
  await producer.connect();
  await producer.send({
    topic: "notifications",
    messages: [{ value: JSON.stringify(notification) }],
  });
  await producer.disconnect();
};
