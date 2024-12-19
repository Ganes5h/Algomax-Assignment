import React, { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormControlLabel,
  Checkbox,
  Paper,
  Container,
  Alert,
} from "@mui/material";
import { useSelector } from "react-redux";
import axios from "axios";

const EventCreationStepper = () => {
  const tenant = useSelector((state) => state.tenantLogin.tenant);

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [eventBasicInfo, setEventBasicInfo] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
    privateEvent: false,
  });

  const [eventLocation, setEventLocation] = useState({
    venue: "",
    address: "",
    city: "",
    country: "",
  });

  const [ticketDetails, setTicketDetails] = useState({
    totalTickets: "",
    availableTickets: "",
    currency: "USD",
    pricing: [
      {
        type: "Standard",
        price: "",
        quantity: "",
        availableQuantity: "",
      },
    ],
  });

  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    accountNumber: "",
    routingNumber: "",
    country: "US",
    currency: "USD",
  });

  const [poster, setPoster] = useState(null);

  const steps = [
    "Basic Information",
    "Location Details",
    "Ticket Details",
    "Bank Details",
    "Upload Poster",
  ];

  const validateBasicInfo = () => {
    const { title, description, category, date, time } = eventBasicInfo;
    if (!title || !description || !category || !date || !time) {
      setError("All fields in Basic Information are required.");
      return false;
    }
    setError("");
    return true;
  };

  const validateLocation = () => {
    const { venue, city, country } = eventLocation;
    if (!venue || !city || !country) {
      setError("All fields in Location Details are required.");
      return false;
    }
    setError("");
    return true;
  };

  const validateTicketDetails = () => {
    const { totalTickets, availableTickets, pricing } = ticketDetails;
    if (!totalTickets || !availableTickets) {
      setError("Total and Available Tickets are required.");
      return false;
    }
    if (pricing.some((p) => !p.type || !p.price || !p.quantity)) {
      setError("Complete all fields in Ticket Pricing.");
      return false;
    }
    setError("");
    return true;
  };

  const validateBankDetails = () => {
    const { accountHolderName, accountNumber, routingNumber } = bankDetails;
    if (!accountHolderName || !accountNumber || !routingNumber) {
      setError("All fields in Bank Details are required.");
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    const validations = [
      validateBasicInfo,
      validateLocation,
      validateTicketDetails,
      validateBankDetails,
    ];
    if (activeStep < validations.length && !validations[activeStep]()) return;

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("title", eventBasicInfo.title);
      formData.append("description", eventBasicInfo.description);
      formData.append("date", eventBasicInfo.date);
      formData.append("time", eventBasicInfo.time);
      formData.append("category", eventBasicInfo.category);
      formData.append("privateEvent", eventBasicInfo.privateEvent);
      formData.append("location", JSON.stringify(eventLocation));
      formData.append("ticketDetails", JSON.stringify(ticketDetails));
      formData.append("bankDetails", JSON.stringify(bankDetails));
      if (poster) formData.append("poster", poster);

      const response = await axios.post("/api/events/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Event created successfully:", response.data);
      setActiveStep(steps.length);
    } catch (error) {
      console.error("Error creating event:", error);
      setError("Failed to create event.");
    }
  };

  const renderBasicInfoStep = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Event Title"
          value={eventBasicInfo.title}
          onChange={(e) =>
            setEventBasicInfo({ ...eventBasicInfo, title: e.target.value })
          }
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={4}
          value={eventBasicInfo.description}
          onChange={(e) =>
            setEventBasicInfo({
              ...eventBasicInfo,
              description: e.target.value,
            })
          }
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Category"
          value={eventBasicInfo.category}
          onChange={(e) =>
            setEventBasicInfo({ ...eventBasicInfo, category: e.target.value })
          }
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          type="date"
          value={eventBasicInfo.date}
          onChange={(e) =>
            setEventBasicInfo({ ...eventBasicInfo, date: e.target.value })
          }
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          type="time"
          value={eventBasicInfo.time}
          onChange={(e) =>
            setEventBasicInfo({ ...eventBasicInfo, time: e.target.value })
          }
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={eventBasicInfo.privateEvent}
              onChange={(e) =>
                setEventBasicInfo({
                  ...eventBasicInfo,
                  privateEvent: e.target.checked,
                })
              }
            />
          }
          label="Private Event"
        />
      </Grid>
    </Grid>
  );

  const renderLocationStep = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Venue"
          value={eventLocation.venue}
          onChange={(e) =>
            setEventLocation({ ...eventLocation, venue: e.target.value })
          }
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address"
          multiline
          rows={2}
          value={eventLocation.address}
          onChange={(e) =>
            setEventLocation({ ...eventLocation, address: e.target.value })
          }
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="City"
          value={eventLocation.city}
          onChange={(e) =>
            setEventLocation({ ...eventLocation, city: e.target.value })
          }
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="Country"
          value={eventLocation.country}
          onChange={(e) =>
            setEventLocation({ ...eventLocation, country: e.target.value })
          }
        />
      </Grid>
    </Grid>
  );

  const renderTicketDetailsStep = () => (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="Total Tickets"
          type="number"
          value={ticketDetails.totalTickets}
          onChange={(e) =>
            setTicketDetails({
              ...ticketDetails,
              totalTickets: e.target.value,
            })
          }
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="Available Tickets"
          type="number"
          value={ticketDetails.availableTickets}
          onChange={(e) =>
            setTicketDetails({
              ...ticketDetails,
              availableTickets: e.target.value,
            })
          }
        />
      </Grid>
    </Grid>
  );

  const renderPosterStep = () => (
    <Box>
      <Typography>Upload Poster</Typography>
      <input
        type="file"
        onChange={(e) => setPoster(e.target.files[0])}
        accept="image/*"
      />
    </Box>
  );

  return (
    <Container
      maxWidth="md"
      style={{
        minHeight: "130vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "30px",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create New Event
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ mt: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {activeStep === steps.length ? (
            <Typography align="center">
              All steps completed - Event created successfully.
            </Typography>
          ) : (
            <Box>
              {activeStep === 0 && renderBasicInfoStep()}
              {activeStep === 1 && renderLocationStep()}
              {activeStep === 2 && renderTicketDetailsStep()}
              {activeStep === 3 && renderPosterStep()}
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
              >
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                >
                  Back
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button variant="contained" onClick={handleSubmit}>
                    Submit
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext}>
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default EventCreationStepper;
