import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
} from "@mui/material";
import {
  EventNote as EventNoteIcon,
  ConfirmationNumber as TicketIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const featureVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const HomePage = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const navigate = useNavigate();
  const features = [
    {
      icon: <EventNoteIcon sx={{ fontSize: 60, color: "primary.main" }} />,
      title: "Event Management",
      description:
        "Seamlessly create, manage, and promote your events with our intuitive platform.",
    },
    {
      icon: <TicketIcon sx={{ fontSize: 60, color: "primary.main" }} />,
      title: "Real-Time Booking",
      description:
        "Book tickets instantly with live availability and secure payment processing.",
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 60, color: "primary.main" }} />,
      title: "Advanced Analytics",
      description:
        "Gain powerful insights into your event performance and attendee demographics.",
    },
  ];

  const navigatetoEvents = () => {
    navigate("/all-events");
  };

  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h2"
            component="h1"
            align="center"
            sx={{
              fontWeight: 700,
              mb: 4,
              color: "text.primary",
              fontSize: {
                xs: "1.5rem", // small devices
                sm: "2rem", // medium devices
                md: "2.5rem", // large devices
                lg: "3rem", // extra large devices
                xl: "3.5rem", // very large devices
              },
            }}
          >
            Event Management Reimagined
          </Typography>

          <Typography
            variant="h5"
            align="center"
            sx={{
              mb: 6,
              color: "text.secondary",
              maxWidth: 800,
              mx: "auto",
            }}
          >
            A comprehensive platform for event organizers and attendees,
            offering seamless event creation, real-time ticket booking, and
            powerful analytics.
          </Typography>

          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{
                mr: 2,
                px: 4,
                py: 1.5,
              }}
            >
              Create an Event
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
              }}
              onClick={navigatetoEvents}
            >
              Browse Events
            </Button>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid
                item
                xs={12}
                md={4}
                key={feature.title}
                component={motion.div}
                variants={featureVariants}
                initial="hidden"
                animate="visible"
                transition={{
                  delay: index * 0.2,
                }}
              >
                <Card
                  elevation={hoveredFeature === index ? 6 : 2}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 3,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    align="center"
                    sx={{ mb: 2 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    align="center"
                    color="text.secondary"
                  >
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default HomePage;
