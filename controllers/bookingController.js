const { Booking } = require("../models/UserModel");
const { Event, User } = require("../models/UserModel");
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

// Controller to create a payment intent
exports.createPaymentIntent = async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: "Booking ID is required" });
  }

  try {
    // Fetch the booking details
    const booking = await Booking.findById(bookingId).populate("event");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Get event details
    const event = booking.event;

    // Ensure that there are available tickets for the event
    const ticketDetails = booking.ticketDetails;
    let availableTickets = true;

    // Check if the quantity of the ticket type exceeds the available tickets
    for (const ticket of ticketDetails) {
      const eventTicket = event.ticketDetails.find(
        (eventTicket) => eventTicket.type === ticket.type
      );
      if (eventTicket && eventTicket.availableQuantity < ticket.quantity) {
        availableTickets = false;
        break;
      }
    }

    if (!availableTickets) {
      return res.status(400).json({ error: "Not enough available tickets" });
    }

    // Calculate the total amount (assuming the total price is already set in the booking)
    const totalPrice = booking.totalPrice;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100, // Convert to smallest currency unit (cents)
      currency: event.currency || "USD", // Default to USD if not provided by event
      metadata: {
        bookingId: booking._id,
        userId: booking.user,
      },
    });

    // Respond with the client secret to be used in the frontend
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Utility functions for QR generation and email
const qrcode = require("qrcode");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// Multer configuration for QR code storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/qrcodes");
  },
  filename: function (req, file, cb) {
    cb(null, `qr-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service
  auth: {
    user: process.env.SMTP_EMIAL, // Your email
    pass: process.env.SMTP_PASS, // Your email password or app password
  },
});

// Razorpay configuration
const Razorpay = require("razorpay");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// console.log(process.env.RAZORPAY_KEY_ID, "Id", process.env.RAZORPAY_KEY_SECRET);
// Booking Controller
exports.BookingController = {
  // Create a new booking and initialize Razorpay payment

  createBooking: async (req, res) => {
    try {
      console.log("Request received at createBooking:", req.body); // Debug incoming request

      const { eventId, ticketDetails, userId } = req.body;

      if (!eventId || !ticketDetails || !userId) {
        console.error("Missing required fields in request body.");
        return res.status(400).json({
          success: false,
          message: "eventId, ticketDetails, and userId are required.",
        });
      }

      // Calculate total price
      const totalPrice = ticketDetails.reduce((sum, ticket) => {
        if (!ticket.price || !ticket.quantity) {
          console.error("Invalid ticket details:", ticket);
        }
        return sum + ticket.price * ticket.quantity;
      }, 0);

      console.log("Calculated total price:", totalPrice);

      if (totalPrice <= 0) {
        console.error("Total price is invalid:", totalPrice);
        return res.status(400).json({
          success: false,
          message: "Invalid total price calculated.",
        });
      }

      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: totalPrice * 100, // Convert to paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      console.log("Razorpay order created:", order);

      if (!order || !order.id) {
        console.error("Failed to create Razorpay order.");
        return res.status(500).json({
          success: false,
          message: "Failed to create Razorpay order.",
        });
      }

      // Create booking record
      const booking = new Booking({
        event: eventId,
        user: userId,
        ticketDetails,
        totalPrice,
        paymentDetails: {
          razorpayOrderId: order.id,
          status: "pending",
        },
        status: "pending",
      });

      console.log("Booking to be saved:", booking);

      await booking.save();

      console.log("Booking saved successfully:", booking);

      res.status(200).json({
        success: true,
        data: {
          orderId: order.id,
          booking: booking,
        },
      });
    } catch (error) {
      console.error("Error in createBooking:", error.message, error.stack);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Verify payment and update booking status
  verifyPayment: async (req, res) => {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } =
        req.body;

      // Verify signature
      const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generated_signature !== razorpaySignature) {
        throw new Error("Invalid payment signature");
      }

      // Update booking status
      const booking = await Booking.findOne({
        "paymentDetails.razorpayOrderId": razorpayOrderId,
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      // Generate QR code
      const qrData = {
        bookingId: booking._id,
        eventId: booking.event,
        userId: booking.user,
      };

      const qrCodePath = path.join(
        __dirname,
        "../uploads/qrcodes",
        `qr-${booking._id}.png`
      );
      await qrcode.toFile(qrCodePath, JSON.stringify(qrData));

      // Update booking with payment and QR details
      booking.paymentDetails.razorpayPaymentId = razorpayPaymentId;
      booking.paymentDetails.razorpaySignature = razorpaySignature;
      booking.paymentDetails.status = "paid";
      booking.status = "confirmed";
      booking.qrCode = {
        data: qrCodePath,
        contentType: "image/png",
      };

      await booking.save();

      // Send confirmation email with QR code
      const event = await Event.findById(booking.event);
      const user = await User.findById(booking.user);

      const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: user.email,
        subject: `Booking Confirmation - ${event.title}`,
        html: `
          <h1>Booking Confirmation</h1>
          <p>Thank you for booking tickets for ${event.title}!</p>
          <p>Your booking details:</p>
          <ul>
            <li>Event: ${event.title}</li>
            <li>Date: ${event.date}</li>
            <li>Time: ${event.time}</li>
            <li>Venue: ${event.location.venue}</li>
          </ul>
          <p>Please present the attached QR code at the venue entrance.</p>
        `,
        attachments: [
          {
            filename: "qrcode.png",
            path: qrCodePath,
          },
        ],
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        success: true,
        message: "Payment verified and booking confirmed",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Verify QR code at venue
  verifyQRCode: async (req, res) => {
    try {
      const { qrData } = req.body;

      // Parse QR data
      const bookingData = JSON.parse(qrData);

      // Verify booking
      const booking = await Booking.findOne({
        _id: bookingData.bookingId,
        event: bookingData.eventId,
        user: bookingData.userId,
        status: "confirmed",
        "paymentDetails.status": "paid",
      });

      if (!booking) {
        throw new Error("Invalid or expired QR code");
      }

      res.status(200).json({
        success: true,
        message: "QR code verified successfully",
        booking: booking,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

// module.exports = {
//   BookingController,
// };
