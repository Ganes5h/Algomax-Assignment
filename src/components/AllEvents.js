// import React, { useState, useEffect } from "react";
// import {
//   Grid,
//   Card,
//   CardMedia,
//   CardContent,
//   Typography,
//   Button,
//   Box,
//   IconButton,
//   Pagination,
//   CircularProgress,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
// } from "@mui/material";
// import { loadStripe } from "@stripe/stripe-js";
// import {
//   Elements,
//   PaymentElement,
//   useStripe,
//   useElements,
// } from "@stripe/react-stripe-js";
// import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
// import axios from "axios";

// const stripePromise = loadStripe("your-stripe-public-key");

// const PaymentForm = ({
//   clientSecret,
//   booking,
//   onPaymentSuccess,
//   onPaymentError,
// }) => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [error, setError] = useState(null);
//   const [processing, setProcessing] = useState(false);

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     if (!stripe || !elements) return;

//     setProcessing(true);
//     const { error, paymentIntent } = await stripe.confirmPayment({
//       elements,
//       confirmParams: {
//         return_url: window.location.origin,
//       },
//       redirect: "if_required",
//     });

//     if (error) {
//       setError(error.message);
//       onPaymentError(error.message);
//       setProcessing(false);
//     } else if (paymentIntent.status === "succeeded") {
//       try {
//         await axios.post(
//           `https://algomax-assignment.onrender.com/api/bookings/${booking._id}/confirm-payment`,
//           { paymentIntentId: paymentIntent.id }
//         );
//         onPaymentSuccess(booking);
//       } catch (confirmError) {
//         onPaymentError("Payment confirmation failed");
//       }
//       setProcessing(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <PaymentElement />
//       {error && <Typography color="error">{error}</Typography>}
//       <Button
//         type="submit"
//         variant="contained"
//         color="primary"
//         disabled={processing || !stripe}
//       >
//         {processing ? "Processing..." : "Pay Now"}
//       </Button>
//     </form>
//   );
// };

// const CardComponent = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [eventsPerPage] = useState(6);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [selectedTickets, setSelectedTickets] = useState({});
//   const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
//   const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
//   const [currentBooking, setCurrentBooking] = useState(null);
//   const [clientSecret, setClientSecret] = useState(null);
//   const [bookingError, setBookingError] = useState(null);

//   const user = JSON.parse(localStorage.getItem("user")); // Parse the JSON string
//   const userId = user ? user.id : null;

//   // Fetch events data
//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const response = await axios.get(
//           "https://algomax-assignment.onrender.com/api/events/getallevents"
//         );
//         setEvents(response.data.events);
//       } catch (error) {
//         console.error("Error fetching events:", error);
//         setBookingError("Error fetching events, please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchEvents();
//   }, []);

//   // Pagination logic
//   const indexOfLastEvent = currentPage * eventsPerPage;
//   const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
//   const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

//   const handlePageChange = (_, value) => setCurrentPage(value);

//   const handleBuyTicket = (event) => {
//     setSelectedEvent(event);
//     const initialTicketSelections = event.ticketDetails.pricing.reduce(
//       (acc, ticket) => ({ ...acc, [ticket.type]: 0 }),
//       {}
//     );
//     setSelectedTickets(initialTicketSelections);
//     setBookingDialogOpen(true);
//   };

//   const handleTicketQuantityChange = (type, quantity) => {
//     setSelectedTickets((prev) => ({
//       ...prev,
//       [type]: Math.max(0, quantity),
//     }));
//   };

//   const calculateTotalPrice = () => {
//     if (!selectedEvent) return 0;
//     return selectedEvent.ticketDetails.pricing.reduce((total, ticket) => {
//       return total + ticket.price * (selectedTickets[ticket.type] || 0);
//     }, 0);
//   };

//   const handleCreateBooking = async () => {
//     try {
//       const ticketDetails = Object.entries(selectedTickets)
//         .filter(([_, quantity]) => quantity > 0)
//         .map(([type, quantity]) => ({ type, quantity }));

//       const bookingResponse = await axios.post(
//         "https://algomax-assignment.onrender.com/api/bookings/",
//         {
//           userId: userId,
//           eventId: selectedEvent._id,
//           ticketDetails,
//           totalPrice: calculateTotalPrice(),
//         }
//       );

//       setBookingDialogOpen(false);

//       const paymentResponse = await axios.post(
//         "http://localhost:4000/api/bookings/create-payment-intent",
//         { bookingId: bookingResponse.data._id }
//       );

//       setCurrentBooking(bookingResponse.data);
//       setClientSecret(paymentResponse.data.clientSecret);
//       setPaymentDialogOpen(true);
//     } catch (error) {
//       console.error("Booking creation error:", error);
//       setBookingError("Booking creation failed. Please try again.");
//     }
//   };

//   return (
//     <Box sx={{ py: 4, px: 2, paddingTop: "80px" }}>
//       <Grid container spacing={4}>
//         {loading ? (
//           <Grid item xs={12} display="flex" justifyContent="center">
//             <CircularProgress />
//           </Grid>
//         ) : (
//           currentEvents.map((event) => (
//             <Grid item xs={12} sm={6} md={4} key={event._id}>
//               <Card
//                 sx={{
//                   boxShadow: 3,
//                   borderRadius: 2,
//                   overflow: "hidden",
//                   position: "relative",
//                 }}
//               >
//                 <CardMedia
//                   component="img"
//                   height="200"
//                   image={`https://algomax-assignment.onrender.com/${event.poster.replace(
//                     "\\",
//                     "/"
//                   )}`}
//                   alt={event.title}
//                 />
//                 <IconButton
//                   sx={{
//                     position: "absolute",
//                     top: 10,
//                     right: 10,
//                     backgroundColor: "white",
//                     color: "gray",
//                     "&:hover": { color: "red" },
//                   }}
//                 >
//                   <FavoriteBorderIcon />
//                 </IconButton>
//                 <CardContent>
//                   <Typography variant="h6" fontWeight="bold" gutterBottom>
//                     {event.title}
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     color="text.secondary"
//                     gutterBottom
//                   >
//                     Organized by <strong>{event.managedBy.name}</strong>
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     📅 {new Date(event.date).toLocaleDateString()} <br />
//                     📍 {event.location.venue}, {event.location.city},{" "}
//                     {event.location.country} <br />⏰ {event.time}
//                   </Typography>
//                   <Box mt={2} display="flex" justifyContent="space-between">
//                     <Typography variant="h6" color="primary">
//                       From {event.ticketDetails.pricing[0].price}{" "}
//                       {event.ticketDetails.currency}
//                     </Typography>
//                     <Button
//                       variant="contained"
//                       color="primary"
//                       onClick={() => handleBuyTicket(event)}
//                     >
//                       Buy Ticket
//                     </Button>
//                   </Box>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))
//         )}
//       </Grid>

//       <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
//         <Pagination
//           count={Math.ceil(events.length / eventsPerPage)}
//           page={currentPage}
//           onChange={handlePageChange}
//           color="primary"
//         />
//       </Box>

//       {/* Booking Dialog */}
//       <Dialog
//         open={bookingDialogOpen}
//         onClose={() => setBookingDialogOpen(false)}
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle>Book Tickets for {selectedEvent?.title}</DialogTitle>
//         <DialogContent>
//           <Box>
//             {selectedEvent?.ticketDetails.pricing.map((ticket) => (
//               <Box key={ticket.type} display="flex" alignItems="center" my={2}>
//                 <Typography variant="body1" sx={{ flex: 1 }}>
//                   {ticket.type}
//                 </Typography>
//                 <Box display="flex" alignItems="center">
//                   <Button
//                     onClick={() =>
//                       handleTicketQuantityChange(
//                         ticket.type,
//                         selectedTickets[ticket.type] - 1
//                       )
//                     }
//                   >
//                     -
//                   </Button>
//                   <Typography variant="body1" sx={{ mx: 1 }}>
//                     {selectedTickets[ticket.type]}
//                   </Typography>
//                   <Button
//                     onClick={() =>
//                       handleTicketQuantityChange(
//                         ticket.type,
//                         selectedTickets[ticket.type] + 1
//                       )
//                     }
//                   >
//                     +
//                   </Button>
//                 </Box>
//               </Box>
//             ))}
//           </Box>
//           <Typography variant="h6" mt={2} fontWeight="bold">
//             Total: {calculateTotalPrice()}{" "}
//             {selectedEvent?.ticketDetails.currency}
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleCreateBooking}
//             disabled={Object.values(selectedTickets).every((qty) => qty === 0)}
//           >
//             Confirm Booking
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Payment Dialog */}
//       {clientSecret && (
//         <Dialog
//           open={paymentDialogOpen}
//           onClose={() => setPaymentDialogOpen(false)}
//         >
//           <DialogTitle>Complete Payment</DialogTitle>
//           <DialogContent>
//             <Elements stripe={stripePromise} options={{ clientSecret }}>
//               <PaymentForm
//                 clientSecret={clientSecret}
//                 booking={currentBooking}
//                 onPaymentSuccess={(booking) => {
//                   setPaymentDialogOpen(false);
//                   setCurrentBooking(null);
//                   // Redirect or show success message
//                 }}
//                 onPaymentError={(message) => {
//                   setPaymentDialogOpen(false);
//                   alert("Payment failed: " + message);
//                 }}
//               />
//             </Elements>
//           </DialogContent>
//         </Dialog>
//       )}

//       {/* Error Messages */}
//       {bookingError && (
//         <Box sx={{ mt: 2, color: "red" }}>
//           <Typography variant="body2">{bookingError}</Typography>
//         </Box>
//       )}
//     </Box>
//   );
// };

// export default CardComponent;
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
} from "@mui/material";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2

const EventListing = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketSelections, setTicketSelections] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const razorpayKeyId = process.env.REACT_APP_RAZORPAY_KEY_ID;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/events/getallevents"
      );
      setEvents(response.data.events);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to fetch events",
        text: error.message,
      });
    }
  };

  const handleBooking = (event) => {
    setSelectedEvent(event);
    setTicketSelections({});
    event.ticketDetails.pricing.forEach((ticket) => {
      setTicketSelections((prev) => ({
        ...prev,
        [ticket._id]: 0,
      }));
    });
    setOpenDialog(true);
  };

  const handleTicketChange = (ticketId, value) => {
    setTicketSelections((prev) => ({
      ...prev,
      [ticketId]: value,
    }));
  };

  const calculateTotal = () => {
    if (!selectedEvent) return 0;
    return selectedEvent.ticketDetails.pricing.reduce((total, ticket) => {
      return total + ticket.price * (ticketSelections[ticket._id] || 0);
    }, 0);
  };

  const handlePayment = async () => {
    const ticketDetails = selectedEvent.ticketDetails.pricing
      .filter((ticket) => ticketSelections[ticket._id] > 0)
      .map((ticket) => ({
        type: ticket.type,
        price: ticket.price,
        quantity: ticketSelections[ticket._id],
      }));

    try {
      const response = await axios.post(
        "http://localhost:4000/api/bookings/bookings",
        {
          eventId: selectedEvent._id,
          ticketDetails,
          userId: "67533ea6ae408d900db76423", // Replace with actual user ID from your auth system
        }
      );

      const options = {
        key: razorpayKeyId,
        amount: calculateTotal() * 100,
        currency: selectedEvent.ticketDetails.currency,
        name: selectedEvent.title,
        order_id: response.data.data.orderId,
        handler: async (response) => {
          try {
            await axios.post(
              "http://localhost:4000/api/bookings/bookings/verify-payment",
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }
            );

            // Show success alert with SweetAlert
            Swal.fire({
              icon: "success",
              title: "Booking Confirmed!",
              text: "Check your email for booking details.",
              confirmButtonText: "OK",
            });

            setOpenDialog(false);
          } catch (error) {
            // Show error alert if payment verification fails
            Swal.fire({
              icon: "error",
              title: "Payment Verification Failed",
              text: error.message,
              confirmButtonText: "Try Again",
            });
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to Create Booking",
        text: error.message,
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 12 }}>
      <Grid container spacing={4}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event._id}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardMedia
                component="img"
                height="200"
                image={`http://localhost:4000/${event.poster.replace(
                  "\\",
                  "/"
                )}`}
                alt={event.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {event.title}
                </Typography>
                <Typography>{event.description}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {`${event.location.venue}, ${event.location.city}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => handleBooking(event)}
                >
                  Book Tickets
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
          Book Tickets - {selectedEvent?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {selectedEvent?.ticketDetails.pricing.map((ticket) => (
              <Box
                key={ticket._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                  p: 2,
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Box>
                  <Typography variant="body1" fontWeight="500">
                    {ticket.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {`${ticket.price} ${selectedEvent.ticketDetails.currency}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Available: {ticket.availableQuantity}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <IconButton
                    onClick={() =>
                      handleTicketChange(
                        ticket._id,
                        Math.max((ticketSelections[ticket._id] || 0) - 1, 0)
                      )
                    }
                    disabled={ticketSelections[ticket._id] === 0}
                    size="small"
                    color="primary"
                  >
                    -
                  </IconButton>
                  <Typography
                    sx={{
                      minWidth: "32px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {ticketSelections[ticket._id] || 0}
                  </Typography>
                  <IconButton
                    onClick={() =>
                      handleTicketChange(
                        ticket._id,
                        Math.min(
                          (ticketSelections[ticket._id] || 0) + 1,
                          ticket.availableQuantity
                        )
                      )
                    }
                    disabled={
                      ticketSelections[ticket._id] >= ticket.availableQuantity
                    }
                    size="small"
                    color="primary"
                  >
                    +
                  </IconButton>
                </Box>
              </Box>
            ))}
            <Typography
              variant="h6"
              sx={{
                mt: 3,
                textAlign: "right",
                fontWeight: "bold",
                color: "primary.main",
              }}
            >
              Total: {calculateTotal()} {selectedEvent?.ticketDetails.currency}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", p: 3 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            variant="contained"
            color="primary"
            disabled={calculateTotal() === 0}
          >
            Proceed to Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventListing;
