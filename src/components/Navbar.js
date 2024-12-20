import React, { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  CssBaseline,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  Event,
  Dashboard,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

const navRoutes = [
  { label: "Home", path: "/", icon: null },
  { label: "Explore Events", path: "/all-events" },
  { label: "My Events", path: "/my-events" },
];

const PlatformNavbar = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleDrawerToggle();
    handleMenuClose();
  };

  const renderNavItems = (isMobile = false) =>
    navRoutes.map((route) => (
      <Button
        key={route.label}
        startIcon={route.icon}
        onClick={() => handleNavigation(route.path)}
        sx={{
          color: "white",
          textTransform: "none",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.1)",
          },
        }}
      >
        {route.label}
      </Button>
    ));

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{ textAlign: "center", width: drawerWidth }}
    >
      <Typography variant="h6" sx={{ my: 2 }}>
        Event Platform
      </Typography>
      <List>
        {navRoutes.map((route) => (
          <ListItem
            key={route.label}
            disablePadding
            onClick={() => handleNavigation(route.path)}
          >
            <ListItemText primary={route.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#c30345",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              display: { xs: "none", sm: "block" },
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            Event Platform
          </Typography>

          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {renderNavItems()}
            {/* Dropdown for Register/Login Tenant */}
            <Button
              color="inherit"
              onClick={handleMenuOpen}
              sx={{
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Register/Login Tenant
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleNavigation("/tanent-register")}>
                Register Tenant
              </MenuItem>
              <MenuItem onClick={() => handleNavigation("/tanent-login")}>
                Login Tenant
              </MenuItem>
            </Menu>
          </Box>

          <Box>
            {isAuthenticated ? (
              <IconButton color="inherit">
                <AccountCircle />
              </IconButton>
            ) : (
              <Button color="inherit" onClick={() => navigate("/public-login")}>
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default PlatformNavbar;
