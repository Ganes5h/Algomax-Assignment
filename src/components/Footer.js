import React from "react";
import { motion } from "framer-motion";
import { Container, Typography, Grid, Box, IconButton } from "@mui/material";
import { Facebook, Twitter, Instagram, LinkedIn } from "@mui/icons-material";

const FooterSection = () => {
  const socialLinks = [
    { icon: <Facebook />, href: "#" },
    { icon: <Twitter />, href: "#" },
    { icon: <Instagram />, href: "#" },
    { icon: <LinkedIn />, href: "#" },
  ];

  const footerLinks = {
    Platform: [
      { label: "How it Works", href: "#" },
      { label: "Features", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Security", href: "#" },
    ],
    Company: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "#" },
    ],
    Support: [
      { label: "Help Center", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Accessibility", href: "#" },
    ],
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "black",
        color: "white",
        py: { xs: 4, sm: 6, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={4}
          justifyContent="center" // Center items horizontally
          textAlign={{ xs: "center", sm: "left" }} // Center align text on small screens
        >
          {Object.entries(footerLinks).map(([section, links]) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={section}
              component={motion.div}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
              >
                {section}
              </Typography>
              {links.map((link) => (
                <Typography
                  key={link.label}
                  variant="body2"
                  sx={{
                    mb: 1,
                    color: "grey.500",
                    "&:hover": {
                      color: "primary.main",
                      cursor: "pointer",
                    },
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Grid>
          ))}
        </Grid>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Box
            sx={{
              mt: { xs: 4, sm: 6 },
              pt: 4,
              borderTop: "1px solid",
              borderColor: "grey.800",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" }, // Stack vertically on small screens
              alignItems: "center",
              justifyContent: "center", // Center content horizontally
              gap: 2,
              textAlign: "center",
            }}
          >
            <Typography
              variant="body2"
              color="grey.500"
              sx={{ mb: { xs: 2, sm: 0 } }}
            >
              © {new Date().getFullYear()} Event Management Platform. All Rights
              Reserved.
            </Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  color="primary"
                  sx={{
                    color: "white",
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default FooterSection;
