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
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import axios from "axios";

const CardComponent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(6); // Adjust the number of events per page

  // Fetch events data from API
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/events/getallevents")
      .then((response) => {
        setEvents(response.data.events);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setLoading(false);
      });
  }, []);

  // Calculate the events to display based on the current page
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
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
                {/* Fix the image path */}
                <CardMedia
                  component="img"
                  height="200"
                  image={`http://localhost:4000/${event.poster.replace(
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
                    <Button variant="contained" color="primary">
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
    </Box>
  );
};

export default CardComponent;
