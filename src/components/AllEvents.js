import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  Pagination,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import axios from "axios";

const stripePromise = loadStripe("your-stripe-public-key");

const PaymentForm = ({
  clientSecret,
  booking,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: "if_required",
    });

    if (error) {
      setError(error.message);
      onPaymentError(error.message);
      setProcessing(false);
    } else if (paymentIntent.status === "succeeded") {
      try {
        await axios.post(
          `https://algomax-assignment.onrender.com/api/bookings/${booking._id}/confirm-payment`,
          { paymentIntentId: paymentIntent.id }
        );
        onPaymentSuccess(booking);
      } catch (confirmError) {
        onPaymentError("Payment confirmation failed");
      }
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <Typography color="error">{error}</Typography>}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={processing || !stripe}
      >
        {processing ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
};

const CardComponent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(6);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user")); // Parse the JSON string
  const userId = user ? user.id : null;

  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          "https://algomax-assignment.onrender.com/api/events/getallevents"
        );
        setEvents(response.data.events);
      } catch (error) {
        console.error("Error fetching events:", error);
        setBookingError("Error fetching events, please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  const handlePageChange = (_, value) => setCurrentPage(value);

  const handleBuyTicket = (event) => {
    setSelectedEvent(event);
    const initialTicketSelections = event.ticketDetails.pricing.reduce(
      (acc, ticket) => ({ ...acc, [ticket.type]: 0 }),
      {}
    );
    setSelectedTickets(initialTicketSelections);
    setBookingDialogOpen(true);
  };

  const handleTicketQuantityChange = (type, quantity) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [type]: Math.max(0, quantity),
    }));
  };

  const calculateTotalPrice = () => {
    if (!selectedEvent) return 0;
    return selectedEvent.ticketDetails.pricing.reduce((total, ticket) => {
      return total + ticket.price * (selectedTickets[ticket.type] || 0);
    }, 0);
  };

  const handleCreateBooking = async () => {
    try {
      const ticketDetails = Object.entries(selectedTickets)
        .filter(([_, quantity]) => quantity > 0)
        .map(([type, quantity]) => ({ type, quantity }));

      const bookingResponse = await axios.post(
        "https://algomax-assignment.onrender.com/api/bookings/",
        {
          userId: userId,
          eventId: selectedEvent._id,
          ticketDetails,
          totalPrice: calculateTotalPrice(),
        }
      );

      setBookingDialogOpen(false);

      const paymentResponse = await axios.post(
        "https://algomax-assignment.onrender.com/api/bookings/create-payment-intent",
        { bookingId: bookingResponse.data._id }
      );

      setCurrentBooking(bookingResponse.data);
      setClientSecret(paymentResponse.data.clientSecret);
      setPaymentDialogOpen(true);
    } catch (error) {
      console.error("Booking creation error:", error);
      setBookingError("Booking creation failed. Please try again.");
    }
  };

  return (
    <Box sx={{ py: 4, px: 2, paddingTop: "80px" }}>
      <Grid container spacing={4}>
        {loading ? (
          <Grid item xs={12} display="flex" justifyContent="center">
            <CircularProgress />
          </Grid>
        ) : (
          currentEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event._id}>
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={`https://algomax-assignment.onrender.com/${event.poster.replace(
                    "\\",
                    "/"
                  )}`}
                  alt={event.title}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    backgroundColor: "white",
                    color: "gray",
                    "&:hover": { color: "red" },
                  }}
                >
                  <FavoriteBorderIcon />
                </IconButton>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {event.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Organized by <strong>{event.managedBy.name}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📅 {new Date(event.date).toLocaleDateString()} <br />
                    📍 {event.location.venue}, {event.location.city},{" "}
                    {event.location.country} <br />⏰ {event.time}
                  </Typography>
                  <Box mt={2} display="flex" justifyContent="space-between">
                    <Typography variant="h6" color="primary">
                      From {event.ticketDetails.pricing[0].price}{" "}
                      {event.ticketDetails.currency}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleBuyTicket(event)}
                    >
                      Buy Ticket
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={Math.ceil(events.length / eventsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {/* Booking Dialog */}
      <Dialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Book Tickets for {selectedEvent?.title}</DialogTitle>
        <DialogContent>
          <Box>
            {selectedEvent?.ticketDetails.pricing.map((ticket) => (
              <Box key={ticket.type} display="flex" alignItems="center" my={2}>
                <Typography variant="body1" sx={{ flex: 1 }}>
                  {ticket.type}
                </Typography>
                <Box display="flex" alignItems="center">
                  <Button
                    onClick={() =>
                      handleTicketQuantityChange(
                        ticket.type,
                        selectedTickets[ticket.type] - 1
                      )
                    }
                  >
                    -
                  </Button>
                  <Typography variant="body1" sx={{ mx: 1 }}>
                    {selectedTickets[ticket.type]}
                  </Typography>
                  <Button
                    onClick={() =>
                      handleTicketQuantityChange(
                        ticket.type,
                        selectedTickets[ticket.type] + 1
                      )
                    }
                  >
                    +
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
          <Typography variant="h6" mt={2} fontWeight="bold">
            Total: {calculateTotalPrice()}{" "}
            {selectedEvent?.ticketDetails.currency}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateBooking}
            disabled={Object.values(selectedTickets).every((qty) => qty === 0)}
          >
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      {clientSecret && (
        <Dialog
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
        >
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                clientSecret={clientSecret}
                booking={currentBooking}
                onPaymentSuccess={(booking) => {
                  setPaymentDialogOpen(false);
                  setCurrentBooking(null);
                  // Redirect or show success message
                }}
                onPaymentError={(message) => {
                  setPaymentDialogOpen(false);
                  alert("Payment failed: " + message);
                }}
              />
            </Elements>
          </DialogContent>
        </Dialog>
      )}

      {/* Error Messages */}
      {bookingError && (
        <Box sx={{ mt: 2, color: "red" }}>
          <Typography variant="body2">{bookingError}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default CardComponent;
