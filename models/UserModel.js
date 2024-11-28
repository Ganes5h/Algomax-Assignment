const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

// SuperAdmin Model
const SuperAdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email",
      },
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    role: {
      type: String,
      default: "superAdmin",
      enum: ["superAdmin"],
    },
  },
  { timestamps: true }
);

// Tenant KYC Model
const TenantKYCSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
    },
    taxId: {
      type: String,
      required: [true, "Tax ID is required"],
      unique: true,
    },
    documentType: {
      type: String,
      enum: {
        values: ["Business License", "Tax Certificate", "Company Registration"],
        message: "Invalid document type",
      },
    },
    documentUrls: [String],
    verificationStatus: {
      type: String,
      enum: {
        values: ["pending", "verified", "rejected"],
        message: "Invalid verification status",
      },
      default: "pending",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
    },
    verificationNotes: String,
  },
  { timestamps: true }
);

// EventAdmin Model
const EventAdminSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email",
      },
    },
    password: {
      type: String,
      required: true,
      // minlength: [8, "Password must be at least 8 characters long"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    assignedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    permissions: {
      canCreate: {
        type: Boolean,
        default: true,
      },
      canUpdate: {
        type: Boolean,
        default: true,
      },
      canDelete: {
        type: Boolean,
        default: true,
      },
      canManageTickets: {
        type: Boolean,
        default: true,
      },
    },
    status: {
      type: String,
      enum: {
        values: ["active", "suspended"],
        message: "Invalid admin status",
      },
      default: "active",
    },
  },
  { timestamps: true }
);

// Tenant Model
const TenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tenant name is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return validator.isMobilePhone(v, "any");
        },
        message: "Please provide a valid phone number",
      },
    },
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    branding: {
      logo: String,
      primaryColor: {
        type: String,
        validate: {
          validator: function (v) {
            return /^#([0-9A-F]{3}){1,2}$/i.test(v);
          },
          message: "Invalid color format",
        },
      },
      secondaryColor: {
        type: String,
        validate: {
          validator: function (v) {
            return /^#([0-9A-F]{3}){1,2}$/i.test(v);
          },
          message: "Invalid color format",
        },
      },
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "active", "suspended"],
        message: "Invalid tenant status",
      },
      default: "pending",
    },
    eventAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EventAdmin",
      },
    ],
    kycDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TenantKYC",
    },
    stripeAccountId: String,
  },
  { timestamps: true }
);

// User Model
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email",
      },
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    stripeCustomerId: String,
  },
  { timestamps: true }
);

// Event Model
const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [100, "Event title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      maxlength: [1000, "Event description cannot exceed 1000 characters"],
    },
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    eventAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EventAdmin",
      },
    ],
    poster: {
      type: String, // This will store the path to the uploaded poster image
      required: [true, "Event poster is required"],
    },
    location: {
      venue: String,
      address: String,
      city: String,
      country: String,
      coordinates: {
        latitude: {
          type: Number,
          min: [-90, "Latitude must be between -90 and 90"],
          max: [90, "Latitude must be between -90 and 90"],
        },
        longitude: {
          type: Number,
          min: [-180, "Longitude must be between -180 and 180"],
          max: [180, "Longitude must be between -180 and 180"],
        },
      },
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
      validate: {
        validator: function (v) {
          return v > new Date();
        },
        message: "Event date must be in the future",
      },
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Please provide a valid time in HH:MM format",
      ],
    },
    category: {
      type: String,
      enum: {
        values: [
          "Conference",
          "Workshop",
          "Seminar",
          "Concert",
          "Festival",
          "Sports",
          "Exhibition",
          "Networking",
          "Other",
        ],
        message: "Invalid event category",
      },
    },
    bankDetails: {
      accountHolderName: {
        type: String,
        required: [true, "Account holder name is required"],
        trim: true,
      },
      accountNumber: {
        type: String,
        required: [true, "Account number is required"],
        validate: {
          validator: function (v) {
            return /^[0-9]{10,16}$/.test(v); // Stripe expects a valid numeric account number
          },
          message: "Invalid account number",
        },
      },
      routingNumber: {
        type: String,
        required: [true, "Routing number is required"],
        validate: {
          validator: function (v) {
            return /^[0-9]{9}$/.test(v); // Validates 9-digit US routing numbers
          },
          message: "Invalid routing number",
        },
      },
      currency: {
        type: String,
        required: [true, "Currency is required"],
        enum: {
          values: ["USD", "EUR", "GBP", "CAD", "AUD"],
          message: "Invalid currency",
        },
        default: "USD",
      },
      country: {
        type: String,
        required: [true, "Country is required"],
        enum: {
          values: ["US", "CA", "GB", "AU", "EU"],
          message: "Invalid country",
        },
      },
    },
    ticketDetails: {
      totalTickets: {
        type: Number,
        required: [true, "Total tickets is required"],
        min: [1, "Total tickets must be at least 1"],
      },
      availableTickets: {
        type: Number,
        required: [true, "Available tickets is required"],
        min: [0, "Available tickets cannot be negative"],
      },
      pricing: [
        {
          type: {
            type: String,
            enum: {
              values: ["Standard", "VIP", "Early Bird"],
              message: "Invalid ticket type",
            },
          },
          price: {
            type: Number,
            required: [true, "Ticket price is required"],
            min: [0, "Ticket price cannot be negative"],
          },
          quantity: {
            type: Number,
            required: [true, "Ticket quantity is required"],
            min: [1, "Ticket quantity must be at least 1"],
          },
          availableQuantity: {
            type: Number,
            required: [true, "Available ticket quantity is required"],
            min: [0, "Available ticket quantity cannot be negative"],
          },
        },
      ],
      currency: {
        type: String,
        default: "USD",
        enum: {
          values: ["USD", "EUR", "GBP", "CAD", "AUD"],
          message: "Invalid currency",
        },
      },
    },
    privateEvent: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: ["draft", "published", "cancelled"],
        message: "Invalid event status",
      },
      default: "draft",
    },
  },
  { timestamps: true }
);

// Booking Model
const BookingSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    ticketDetails: [
      {
        type: {
          type: String,
          required: [true, "Ticket type is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Ticket quantity is required"],
          min: [1, "Ticket quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: [true, "Ticket price is required"],
          min: [0, "Ticket price cannot be negative"],
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },
    paymentDetails: {
      stripePaymentIntentId: String,
      stripeChargeId: String,
      status: {
        type: String,
        enum: {
          values: ["pending", "paid", "failed", "refunded"],
          message: "Invalid payment status",
        },
        default: "pending",
      },
      receiptUrl: String,
    },
    status: {
      type: String,
      enum: {
        values: ["confirmed", "cancelled"],
        message: "Invalid booking status",
      },
      default: "confirmed",
    },
    qrCode: String,
  },
  { timestamps: true }
);
// Continuation of the previous code...

// Notification Model (Completed)
const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    type: {
      type: String,
      enum: {
        values: [
          "event_update",
          "ticket_availability",
          "booking_confirmation",
          "booking_cancellation",
          "event_reminder",
        ],
        message: "Invalid notification type",
      },
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// User Group Model
const UserGroupSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant is required"],
    },
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Pre-save middleware for password hashing
const hashPassword = async function (next) {
  // Only hash the password if it has been modified
  if (this.isModified("password")) {
    try {
      // Use a higher salt round for better security
      this.password = await bcrypt.hash(this.password, 12);
    } catch (error) {
      return next(error);
    }
  }
  next();
};

// Add password comparison method to schemas
const addPasswordComparisonMethod = (schema) => {
  schema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };
};

// Apply password hashing and comparison methods
SuperAdminSchema.pre("save", hashPassword);
TenantSchema.pre("save", hashPassword);
UserSchema.pre("save", hashPassword);
EventAdminSchema.pre("save", hashPassword);

addPasswordComparisonMethod(SuperAdminSchema);
addPasswordComparisonMethod(TenantSchema);
addPasswordComparisonMethod(UserSchema);
addPasswordComparisonMethod(EventAdminSchema);

// Create indexes for performance optimization
SuperAdminSchema.index({ email: 1 });
TenantSchema.index({ email: 1 });
UserSchema.index({ email: 1, username: 1 });
EventSchema.index({ managedBy: 1, date: 1 });
BookingSchema.index({ event: 1, user: 1 });

// Export all models
module.exports = {
  SuperAdmin: mongoose.model("SuperAdmin", SuperAdminSchema),
  TenantKYC: mongoose.model("TenantKYC", TenantKYCSchema),
  Tenant: mongoose.model("Tenant", TenantSchema),
  EventAdmin: mongoose.model("EventAdmin", EventAdminSchema),
  User: mongoose.model("User", UserSchema),
  Event: mongoose.model("Event", EventSchema),
  Booking: mongoose.model("Booking", BookingSchema),
  Notification: mongoose.model("Notification", NotificationSchema),
  UserGroup: mongoose.model("UserGroup", UserGroupSchema),
};
