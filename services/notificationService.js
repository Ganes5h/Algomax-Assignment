const { Notification } = require("../models/UserModel");

exports.createNotification = async (
  userId,
  type,
  message,
  eventId,
  bookingId
) => {
  const notification = new Notification({
    user: userId,
    type,
    message,
    event: eventId,
    booking: bookingId,
  });
  await notification.save();
};
