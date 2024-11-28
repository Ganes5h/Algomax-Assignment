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
  Payment,
  Help,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

const navRoutes = [
  {
    label: "Events",
    path: "/events",
    icon: <Event />,
    subMenu: [
      { label: "Browse Events", path: "/events/browse" },
      { label: "Create Event", path: "/events/create" },
    ],
  },
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <Dashboard />,
    subMenu: [
      { label: "My Events", path: "/dashboard/events" },
      { label: "Analytics", path: "/dashboard/analytics" },
    ],
  },
  {
    label: "Tickets",
    path: "/tickets",
    icon: <Payment />,
    subMenu: [
      { label: "My Bookings", path: "/tickets/bookings" },
      { label: "Wishlist", path: "/tickets/wishlist" },
    ],
  },
  {
    label: "Support",
    path: "/support",
    icon: <Help />,
  },
];

const PlatformNavbar = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEls, setAnchorEls] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (route) => (event) => {
    setAnchorEls((prev) => ({
      ...prev,
      [route.label]: event.currentTarget,
    }));
  };

  const handleMenuClose = (route) => () => {
    setAnchorEls((prev) => ({
      ...prev,
      [route.label]: null,
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleDrawerToggle();
  };

  const renderNavItems = (isMobile = false) =>
    navRoutes.map((route) => (
      <React.Fragment key={route.label}>
        {route.subMenu ? (
          <>
            <Button
              startIcon={route.icon}
              onClick={handleMenuOpen(route)}
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
            <Menu
              anchorEl={anchorEls[route.label]}
              open={Boolean(anchorEls[route.label])}
              onClose={handleMenuClose(route)}
            >
              {route.subMenu.map((subItem) => (
                <MenuItem
                  key={subItem.label}
                  onClick={() => {
                    handleNavigation(subItem.path);
                    handleMenuClose(route)();
                  }}
                >
                  {subItem.label}
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          <Button
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
        )}
      </React.Fragment>
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
          </Box>

          <Box>
            {isAuthenticated ? (
              <IconButton color="inherit">
                <AccountCircle />
              </IconButton>
            ) : (
              <Button color="inherit" onClick={() => navigate("/login")}>
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
