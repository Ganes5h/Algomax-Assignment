const { Event } = require("../models/UserModel");
const stripeService = require("../services/stripeService");

const { EventAdmin, User, Booking } = require("../models/UserModel");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Create Event Controller
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      managedBy,
      date,
      time,
      category,
      location,
      ticketDetails,
      privateEvent,
      status,
      bankDetails,
    } = req.body;

    // Check if poster is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Event poster is required" });
    }

    // Parse JSON fields
    const parsedLocation = location ? JSON.parse(location) : undefined;
    const parsedTicketDetails = ticketDetails
      ? JSON.parse(ticketDetails)
      : undefined;

    // Construct the event object
    const event = new Event({
      title,
      description,
      managedBy,
      poster: req.file.path, // Save the path of the uploaded poster
      location: parsedLocation,
      date,
      time,
      category,
      ticketDetails: parsedTicketDetails,
      privateEvent,
      status,
      bankDetails: JSON.parse(bankDetails), // Parse bankDetails from JSON string
    });

    // Save event to database
    const savedEvent = await event.save();
    res.status(201).json({
      message: "Event created successfully!",
      event: savedEvent,
    });
  } catch (error) {
    // Remove uploaded poster in case of error
    // if (req.file) {
    //   fs.unlinkSync(req.file.path);
    // }
    res.status(400).json({ error: error.message });
  }
};

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMIAL, // Your email address
    pass: process.env.SMTP_PASS, // Your email password
  },
});

exports.addEventAdmin = async (req, res) => {
  try {
    const { tenantId, eventId, name, email, password } = req.body;

    // Check if event exists and is managed by the tenant
    const event = await Event.findById(eventId);
    if (!event || event.managedBy.toString() !== tenantId) {
      return res.status(404).json({ error: "Event not found or unauthorized" });
    }

    // Check if admin already exists with the same email
    let admin = await EventAdmin.findOne({ email });
    if (admin) {
      return res
        .status(400)
        .json({ error: "Admin with this email already exists" });
    }

    // Create a new admin
    admin = new EventAdmin({
      tenant: tenantId,
      name,
      email,
      password,
      assignedEvents: [eventId],
    });
    await admin.save();

    // Update the event to include the admin
    event.eventAdmins.push(admin._id);
    await event.save();

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "You have been added as an Event Admin",
      html: `
        <p>Hello ${name},</p>
        <p>You have been added as an admin for the event: <b>${event.title}</b>.</p>
        <p>Your credentials are:</p>
        <ul>
          <li>Email: ${email}</li>
          <li>Password: ${password}</li>
        </ul>
        <p>Please login and manage the event as per your permissions.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message:
        "Admin added to the event successfully and email notification sent.",
      admin,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to get all published events excluding bank details
exports.getAllPublishedEvents = async (req, res) => {
  try {
    // Find all events with status 'published', excluding 'bankDetails'
    const publishedEvents = await Event.find({ status: "published" })
      .select("-bankDetails") // Exclude the 'bankDetails' field
      .populate("managedBy eventAdmins", "name email"); // Populate specific fields if needed

    // Send the list of published events
    res.status(200).json({
      success: true,
      message: "Published events retrieved successfully!",
      events: publishedEvents,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: "Failed to retrieve published events",
      error: error.message,
    });
  }
};
exports.getBookedEventsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all bookings for the user and populate event details
    const bookings = await Booking.find({ user: userId })
      .populate("event") // Populate event details
      .exec();

    if (bookings.length === 0) {
      return res.status(404).json({ message: "No events found for this user" });
    }

    // Prepare response with event details
    const events = bookings.map((booking) => ({
      event: booking.event,
      ticketDetails: booking.ticketDetails,
      totalPrice: booking.totalPrice,
      status: booking.status,
    }));

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
};
