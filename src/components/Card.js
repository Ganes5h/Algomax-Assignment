import React from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

const CardComponent = () => {
  const cards = Array(9).fill({
    title: "High School Musical Event",
    organizer: "The World Organizers",
    date: "11 Jun 2023",
    location: "129 Swan Avenue, Baton Rouge, LA",
    time: "05 : 00 PM",
    price: "$18.55",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZXZlbnR8ZW58MHx8MHx8fDA%3D", // Replace with your image URL
  });

  return (
    <Box sx={{ py: 4, px: 2, paddingTop: "80px" }}>
      <Grid container spacing={4}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
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
                image={card.image}
                alt={card.title}
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
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Organized by{" "}
                  <Typography component="span" fontWeight="bold">
                    {card.organizer}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📅 {card.date} <br />
                  📍 {card.location} <br />⏰ {card.time}
                </Typography>
                <Box
                  mt={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" color="primary">
                    Start from {card.price}
                  </Typography>
                  <Button variant="contained" color="primary">
                    Buy Ticket
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CardComponent;
