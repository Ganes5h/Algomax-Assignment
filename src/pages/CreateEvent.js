import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
  Container,
  FormControlLabel,
  Switch,
} from "@mui/material";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";

import Swal from "sweetalert2";

const EventCreationForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    poster: null,
    managedBy: "67533d6cae408d900db763e4",
    location: {
      venue: "",
      address: "",
      city: "",
      country: "",
    },
    date: null,
    time: null,
    category: "",
    ticketDetails: {
      totalTickets: "",
      availableTickets: "",
      pricing: [
        {
          type: "Standard",
          price: "",
          quantity: "",
          availableQuantity: "",
        },
      ],
      currency: "USD",
    },
    bankDetails: {
      accountHolderName: "",
      accountNumber: "",
      routingNumber: "",
      currency: "USD",
      country: "US",
    },
    privateEvent: false,
    status: "",
  });

  const categories = [
    "Conference",
    "Workshop",
    "Seminar",
    "Concert",
    "Festival",
    "Sports",
    "Exhibition",
    "Networking",
    "Other",
  ];

  const currencies = ["USD", "EUR", "GBP", "CAD", "AUD"];
  const countries = ["US", "CA", "GB", "AU", "EU"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value,
      },
    }));
  };

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value,
      },
    }));
  };

  const handleTicketDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      ticketDetails: {
        ...prev.ticketDetails,
        [name]: value,
      },
    }));
  };

  const handlePricingChange = (index, field, value) => {
    setFormData((prev) => {
      const newPricing = [...prev.ticketDetails.pricing];
      newPricing[index] = {
        ...newPricing[index],
        [field]: value,
      };
      return {
        ...prev,
        ticketDetails: {
          ...prev.ticketDetails,
          pricing: newPricing,
        },
      };
    });
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      poster: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "poster") {
        if (formData.poster) {
          formDataToSend.append("poster", formData.poster);
        }
      } else if (
        key === "location" ||
        key === "ticketDetails" ||
        key === "bankDetails"
      ) {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch("http://localhost:4000/api/events/create", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Event created successfully",
          icon: "success",
        });
      } else {
        throw new Error(data.error || "Something went wrong");
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message,
        icon: "error",
      });
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Event
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Details
              </Typography>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                multiline
                rows={4}
                margin="normal"
              />
              <input
                accept="image/*"
                type="file"
                onChange={handleFileChange}
                style={{ marginTop: "1rem" }}
              />
            </Grid>

            {/* Location Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Location Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Venue"
                    name="venue"
                    value={formData.location.venue}
                    onChange={handleLocationChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.location.address}
                    onChange={handleLocationChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={formData.location.city}
                    onChange={handleLocationChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="country"
                    value={formData.location.country}
                    onChange={handleLocationChange}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Date and Time */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Date and Time
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <div className="flex flex-col mb-4">
                    <label
                      htmlFor="event-date"
                      className="text-sm font-medium text-gray-700 mb-2"
                    >
                      Event Date
                    </label>
                    <input
                      type="date"
                      id="event-date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <div className="flex flex-col mb-4">
                    <label
                      htmlFor="event-time"
                      className="text-sm font-medium text-gray-700 mb-2"
                    >
                      Event Time
                    </label>
                    <input
                      type="time"
                      id="event-time"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          time: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </Grid>
              </Grid>
            </Grid>

            {/* Category */}
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Ticket Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Ticket Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Total Tickets"
                    name="totalTickets"
                    value={formData.ticketDetails.totalTickets}
                    onChange={handleTicketDetailsChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Available Tickets"
                    name="availableTickets"
                    value={formData.ticketDetails.availableTickets}
                    onChange={handleTicketDetailsChange}
                    margin="normal"
                  />
                </Grid>

                {/* Standard Ticket Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Standard Tickets
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Price"
                        value={
                          formData.ticketDetails.pricing.find(
                            (p) => p.type === "Standard"
                          )?.price || ""
                        }
                        onChange={(e) =>
                          handlePricingChange(
                            "Standard",
                            "price",
                            e.target.value
                          )
                        }
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Quantity"
                        value={
                          formData.ticketDetails.pricing.find(
                            (p) => p.type === "Standard"
                          )?.quantity || ""
                        }
                        onChange={(e) =>
                          handlePricingChange(
                            "Standard",
                            "quantity",
                            e.target.value
                          )
                        }
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Available Quantity"
                        value={
                          formData.ticketDetails.pricing.find(
                            (p) => p.type === "Standard"
                          )?.availableQuantity || ""
                        }
                        onChange={(e) =>
                          handlePricingChange(
                            "Standard",
                            "availableQuantity",
                            e.target.value
                          )
                        }
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* VIP Ticket Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    VIP Tickets
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Price"
                        value={
                          formData.ticketDetails.pricing.find(
                            (p) => p.type === "VIP"
                          )?.price || ""
                        }
                        onChange={(e) =>
                          handlePricingChange("VIP", "price", e.target.value)
                        }
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Quantity"
                        value={
                          formData.ticketDetails.pricing.find(
                            (p) => p.type === "VIP"
                          )?.quantity || ""
                        }
                        onChange={(e) =>
                          handlePricingChange("VIP", "quantity", e.target.value)
                        }
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Available Quantity"
                        value={
                          formData.ticketDetails.pricing.find(
                            (p) => p.type === "VIP"
                          )?.availableQuantity || ""
                        }
                        onChange={(e) =>
                          handlePricingChange(
                            "VIP",
                            "availableQuantity",
                            e.target.value
                          )
                        }
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Currency</InputLabel>
                    <Select
                      name="currency"
                      value={formData.ticketDetails.currency}
                      onChange={handleTicketDetailsChange}
                      label="Currency"
                    >
                      {currencies.map((currency) => (
                        <MenuItem key={currency} value={currency}>
                          {currency}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Bank Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Bank Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Account Holder Name"
                    name="accountHolderName"
                    value={formData.bankDetails.accountHolderName}
                    onChange={handleBankDetailsChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Number"
                    name="accountNumber"
                    value={formData.bankDetails.accountNumber}
                    onChange={handleBankDetailsChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Routing Number"
                    name="routingNumber"
                    value={formData.bankDetails.routingNumber}
                    onChange={handleBankDetailsChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Currency</InputLabel>
                    <Select
                      name="currency"
                      value={formData.bankDetails.currency}
                      onChange={handleBankDetailsChange}
                      label="Currency"
                    >
                      {currencies.map((currency) => (
                        <MenuItem key={currency} value={currency}>
                          {currency}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Country</InputLabel>
                    <Select
                      name="country"
                      value={formData.bankDetails.country}
                      onChange={handleBankDetailsChange}
                      label="Country"
                    >
                      {countries.map((country) => (
                        <MenuItem key={country} value={country}>
                          {country}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Event Settings */}

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Event Settings
              </Typography>
              <div className="flex flex-col mb-4 w-full sm:w-1/2">
                <label
                  htmlFor="status"
                  className="text-sm font-medium text-gray-700 mb-2"
                >
                  Event Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {["draft", "published", "cancelled"].map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.privateEvent}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        privateEvent: e.target.checked,
                      }))
                    }
                  />
                }
                label="Private Event"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 3 }}
                fullWidth
              >
                Create Event
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default EventCreationForm;
