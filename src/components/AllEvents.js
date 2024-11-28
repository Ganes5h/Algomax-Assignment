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
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import axios from "axios";

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe("pk_test_51BTUDGJAJfZb9HEBwDg86TN1KNprHjkfipXmEDMb0gSCassK5T3ZfxsAbcgKVmAIXF7oZ6ItlZZbXO6idTHE67IM007EwQ4uN3");

const PaymentForm = ({ clientSecret, booking, onPaymentSuccess, onPaymentError }) => {
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
        return_url: window.location.origin, // Adjust as needed
      },
      redirect: "if_required"
    });

    if (error) {
      setError(error.message);
      onPaymentError(error.message);
      setProcessing(false);
    } else if (paymentIntent.status === "succeeded") {
      try {
        await axios.post(`/api/bookings/${booking._id}/confirm-payment`, {
          paymentIntentId: paymentIntent.id
        });
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

  // Fetch events data from API
  useEffect(() => {
    axios
      .get("https://algomax-assignment.onrender.com/api/events/getallevents")
      .then((response) => {
        setEvents(response.data.events);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setLoading(false);
      });
  }, []);

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleBuyTicket = (event) => {
    setSelectedEvent(event);
    const initialTicketSelections = event.ticketDetails.pricing.reduce(
      (acc, ticket) => {
        acc[ticket.type] = 0;
        return acc;
      },
      {}
    );
    setSelectedTickets(initialTicketSelections);
    setBookingDialogOpen(true);
  };



  const handleTicketQuantityChange = (type, quantity) => {
    setSelectedTickets(prev => ({
      ...prev,
      [type]: Math.max(0, quantity)
    }));
  };

  const handlePaymentSuccess = (booking) => {
    setPaymentDialogOpen(false);
    // Redirect or show success message
    window.location.href = `/booking-confirmation/${booking._id}`;
  };

  const handlePaymentError = (errorMessage) => {
    // Handle payment error (show message, etc.)
    console.error(errorMessage);
  };

  const calculateTotalPrice = () => {
    if (!selectedEvent) return 0;
    return selectedEvent.ticketDetails.pricing.reduce((total, ticket) => {
      return total + (ticket.price * (selectedTickets[ticket.type] || 0));
    }, 0);
  };

  const handleCreateBooking = async () => {
    try {
      const ticketDetails = Object.entries(selectedTickets)
        .filter(([_, quantity]) => quantity > 0)
        .map(([type, quantity]) => ({ type, quantity }));

      const userId = "current-user-id"; // Replace with actual authentication

      const bookingResponse = await axios.post(
        "https://algomax-assignment.onrender.com/api/bookings/", 
        {
          userId,
          eventId: selectedEvent._id,
          ticketDetails,
          totalPrice: calculateTotalPrice()
        }
      );

      // Close ticket selection dialog
      setBookingDialogOpen(false);

      // Initiate Stripe payment flow
      const paymentResponse = await axios.post("https://algomax-assignment.onrender.com/api/bookings/create-payment-intent", {
        bookingId: bookingResponse.data._id
      });

      setCurrentBooking(bookingResponse.data);
      setClientSecret(paymentResponse.data.clientSecret);
      setPaymentDialogOpen(true);
    } catch (error) {
      console.error("Booking creation error:", error);
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
                  <Typography
                    variant="h6"
                    component="div"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {event.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Organized by{" "}
                    <Typography component="span" fontWeight="bold">
                      {event.managedBy.name}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📅 {new Date(event.date).toLocaleDateString()} <br />
                    📍 {event.location.venue}, {event.location.city},{" "}
                    {event.location.country} <br />⏰ {event.time}
                  </Typography>
                  <Box
                    mt={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="h6" color="primary">
                      Tickets starting from{" "}
                      {event.ticketDetails.pricing[0].price}{" "}
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
      {/* Pagination */}
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
          {selectedEvent?.ticketDetails.pricing.map((ticket) => (
            <Box 
              key={ticket.type} 
              display="flex" 
              alignItems="center" 
              justifyContent="space-between" 
              my={2}
            >
              <Typography>
                {ticket.type} - {ticket.price} {selectedEvent.ticketDetails.currency}
              </Typography>
              <Box display="flex" alignItems="center">
                <Button 
                  onClick={() => handleTicketQuantityChange(ticket.type, (selectedTickets[ticket.type] || 0) - 1)}
                  disabled={(selectedTickets[ticket.type] || 0) <= 0}
                >
                  -
                </Button>
                <Typography mx={2}>
                  {selectedTickets[ticket.type] || 0}
                </Typography>
                <Button 
                  onClick={() => handleTicketQuantityChange(ticket.type, (selectedTickets[ticket.type] || 0) + 1)}
                  disabled={(selectedTickets[ticket.type] || 0) >= ticket.availableQuantity}
                >
                  +
                </Button>
              </Box>
            </Box>
          ))}
          <Typography variant="h6" mt={2}>
            Total Price: {calculateTotalPrice()} {selectedEvent?.ticketDetails.currency}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateBooking} 
            variant="contained" 
            color="primary"
            disabled={calculateTotalPrice() === 0}
          >
            Create Booking
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog 
        open={paymentDialogOpen} 
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Complete Payment</DialogTitle>
        <DialogContent>
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                clientSecret={clientSecret}
                booking={currentBooking}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CardComponent;