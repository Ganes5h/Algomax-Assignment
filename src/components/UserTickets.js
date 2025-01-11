import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CardMedia,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from "@mui/material";

const UserTickets = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  useEffect(() => {
    // Get user ID from localStorage
    const userData = localStorage.getItem("user");
    const parsedUserData = JSON.parse(userData);
    const userID = parsedUserData.id;

    // Fetch tickets from API
    fetch(`http://localhost:4000/api/events/${userID}/events`)
      .then((response) => response.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setLoading(false);
      });
  }, []);

  const handleClickOpen = (eventItem) => {
    setCurrentEvent(eventItem);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentEvent(null);
  };

  return (
    <>
      <div style={{ marginTop: "80px" }}>
        <Typography variant="h3" className="text-center">
          My Booked Events
        </Typography>
      </div>
      <Grid
        container
        spacing={3}
        justifyContent="center"
        // style={{ marginTop: "100px" }}
      >
        {loading ? (
          Array.from(new Array(6)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card className="max-w-sm mx-5 my-5 rounded-xl shadow-lg">
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton width="80%" />
                  <Skeleton width="60%" />
                  <Skeleton width="40%" />
                  <Skeleton width="60%" />
                  <Skeleton width="50%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : events.length === 0 ? (
          <Grid item xs={12}>
            <Typography
              variant="h6"
              align="center"
              style={{ marginTop: "20px", color: "gray" }}
            >
              No data available
            </Typography>
          </Grid>
        ) : (
          events.map((eventItem, index) => {
            const { event, totalPrice, status } = eventItem;
            return (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card className="max-w-sm mx-5 my-5 rounded-xl shadow-lg">
                  <CardMedia
                    className="h-52"
                    image={`http://localhost:4000/${event.poster.replace(
                      /\\/g,
                      "/"
                    )}`} // ensuring the correct image path
                    title={event.title}
                  />
                  <CardContent>
                    <Typography variant="h6" className="font-bold text-primary">
                      {event.title}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {event.description}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Location: {event.location.venue}, {event.location.city},{" "}
                      {event.location.country}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="mt-2 px-2 py-1 rounded-md bg-yellow-400 text-white"
                    >
                      Status: {status}
                    </Typography>
                    <Typography variant="body2" className="text-primary">
                      Total Price: ${totalPrice}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      className="mt-4"
                      onClick={() => handleClickOpen(eventItem)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>Event Details</DialogTitle>
          <DialogContent>
            {currentEvent && (
              <>
                <Typography variant="h6" className="font-bold text-primary">
                  {currentEvent.event.title}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  {currentEvent.event.description}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Location: {currentEvent.event.location.venue},{" "}
                  {currentEvent.event.location.city},{" "}
                  {currentEvent.event.location.country}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Date: {new Date(currentEvent.event.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Time: {currentEvent.event.time}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Status: {currentEvent.status}
                </Typography>
                <Typography variant="body2" className="text-primary">
                  Total Price: ${currentEvent.totalPrice}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Tickets:
                </Typography>
                {currentEvent.ticketDetails.map((ticket, idx) => (
                  <Typography
                    key={idx}
                    variant="body2"
                    className="text-gray-600"
                  >
                    {`${ticket.type} - Quantity: ${ticket.quantity}, Price: $${ticket.price}`}
                  </Typography>
                ))}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </>
  );
};

export default UserTickets;
