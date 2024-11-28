const { Booking } = require("../models/UserModel");
const { Event } = require("../models/UserModel");
const dotenv = require("dotenv");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const QRCode = require("qrcode");

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { userId, eventId, ticketDetails, totalPrice } = req.body;

    // Validate event
    const event = await Event.findById(eventId);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    // Validate ticket availability and calculate total price
    let calculatedTotalPrice = 0;
    const updatedTicketDetails = ticketDetails.map((requestedTicket) => {
      // Find the matching ticket type in the event's pricing
      const eventTicket = event.ticketDetails.pricing.find(
        (ticket) => ticket.type === requestedTicket.type
      );

      if (!eventTicket) {
        throw new Error(`Ticket type ${requestedTicket.type} not found`);
      }

      // Check availability
      if (requestedTicket.quantity > eventTicket.availableQuantity) {
        throw new Error(`Not enough ${requestedTicket.type} tickets available`);
      }

      // Calculate price for this ticket type
      calculatedTotalPrice += eventTicket.price * requestedTicket.quantity;

      return {
        type: requestedTicket.type,
        quantity: requestedTicket.quantity,
        price: eventTicket.price,
      };
    });

    // Verify total price matches
    if (Math.abs(calculatedTotalPrice - totalPrice) > 0.01) {
      return res.status(400).json({
        success: false,
        message: "Price mismatch. Please recalculate.",
      });
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Stripe expects amount in cents
      currency: event.ticketDetails.currency || "usd",
      payment_method_types: ["card"],
      metadata: {
        eventId: event._id.toString(),
        userId: userId.toString(), // Use the userId from the request body
      },
    });

    // Generate QR Code for the booking
    const qrCodeData = JSON.stringify({
      eventId,
      userId, // Use the userId from the request body
      ticketDetails: updatedTicketDetails,
    });
    const qrCode = await QRCode.toDataURL(qrCodeData);

    // Create booking
    const booking = await Booking.create({
      event: eventId,
      user: userId, // Use the userId from the request body
      ticketDetails: updatedTicketDetails,
      totalPrice: calculatedTotalPrice,
      paymentDetails: {
        stripePaymentIntentId: paymentIntent.id,
        status: "pending",
        currency: event.ticketDetails.currency || "USD",
      },
      qrCode,
    });

    // Update ticket availability in the event
    event.ticketDetails.pricing.forEach((ticketType) => {
      const requestedTicket = updatedTicketDetails.find(
        (t) => t.type === ticketType.type
      );

      if (requestedTicket) {
        ticketType.availableQuantity -= requestedTicket.quantity;
      }
    });

    // Update total available tickets
    event.ticketDetails.availableTickets -= updatedTicketDetails.reduce(
      (total, ticket) => total + ticket.quantity,
      0
    );

    await event.save();

    res.status(201).json({
      success: true,
      data: booking,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
    });
  }
};

// Confirm booking payment
exports.confirmBookingPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    // Verify payment
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      booking.paymentDetails.status = "paid";
      booking.paymentDetails.receiptUrl =
        paymentIntent.charges.data[0].receipt_url;
      booking.paymentDetails.stripeChargeId = paymentIntent.charges.data[0].id;

      // Update ticket availability in the event
      const event = await Event.findById(booking.event);

      // Reduce available quantity for each ticket type
      event.ticketDetails.pricing.forEach((ticketType) => {
        const bookingTicket = booking.ticketDetails.find(
          (t) => t.type === ticketType.type
        );

        if (bookingTicket) {
          ticketType.availableQuantity -= bookingTicket.quantity;
        }
      });

      // Reduce total available tickets
      event.ticketDetails.availableTickets -= booking.ticketDetails.reduce(
        (total, ticket) => total + ticket.quantity,
        0
      );

      await event.save();
      await booking.save();

      return res.status(200).json({
        success: true,
        data: booking,
      });
    }

    // If payment failed
    booking.paymentDetails.status = "failed";
    await booking.save();

    res.status(400).json({
      success: false,
      message: "Payment failed",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error confirming payment",
      error: error.message,
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    if (booking.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Booking already cancelled" });
    }

    // Process refund if payment is made
    if (booking.paymentDetails.status === "paid") {
      const refund = await stripe.refunds.create({
        payment_intent: booking.paymentDetails.stripePaymentIntentId,
      });

      booking.paymentDetails.status = "refunded";
      booking.paymentDetails.refundId = refund.id;
    }

    // Update booking status
    booking.status = "cancelled";

    // Restore ticket availability in the event
    const event = await Event.findById(booking.event);

    // Restore available quantity for each ticket type
    event.ticketDetails.pricing.forEach((ticketType) => {
      const bookingTicket = booking.ticketDetails.find(
        (t) => t.type === ticketType.type
      );

      if (bookingTicket) {
        ticketType.availableQuantity += bookingTicket.quantity;
      }
    });

    // Restore total available tickets
    event.ticketDetails.availableTickets += booking.ticketDetails.reduce(
      (total, ticket) => total + ticket.quantity,
      0
    );

    await event.save();
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error.message,
    });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate(
      "event",
      "name date location"
    );
    res
      .status(200)
      .json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message,
    });
  }
};

// Get a single booking
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("event")
      .populate("user", "name email");
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message,
    });
  }
};
