import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import Swal from "sweetalert2";

const TenantAdminTable = () => {
  const [eventData, setEventData] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openAddAdminDialog, setOpenAddAdminDialog] = useState(false);
  const [openAssignEventDialog, setOpenAssignEventDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    permissions: {
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canManageTickets: false,
    },
  });
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");

  const tenantData = localStorage.getItem("tenant");
  const parsedTenantData = JSON.parse(tenantData);
  const tenantId = parsedTenantData._id;
  console.log(tenantData, "This is Id", tenantId);

  // Fetch event data
  useEffect(() => {
    if (tenantId) {
      axios
        .get(`http://localhost:4000/api/tanant/tenant-events/${tenantId}`)
        .then((response) => {
          setEventData(response.data.events);
        })
        .catch((error) => {
          console.error("Error fetching event data:", error);
        });
    }
  }, [tenantId]);

  // Fetch event data from the API
  useEffect(() => {
    if (tenantId) {
      axios
        .get(`http://localhost:4000/api/tanant/tenant-admins/${tenantId}`)
        .then((response) => {
          setAdmins(response.data.eventAdmins);
        })
        .catch((error) => {
          console.error("Error fetching admin data:", error);
        });
    }
  }, [tenantId]);

  // Fetch admin data
  useEffect(() => {
    if (tenantId) {
      axios
        .get(`http://localhost:4000/api/tanant/tenant-admins/${tenantId}`)
        .then((response) => {
          setAdmins(response.data.eventAdmins || []);
        })
        .catch((error) => {
          console.error("Error fetching admin data:", error);
        });
    }
  }, []);

  // Pagination handling
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedData = admins.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Add Admin to the system

  // Add Admin to the system
  const handleAddAdmin = () => {
    if (tenantId) {
      axios
        .post(
          `http://localhost:4000/api/tanant/tenants/${tenantId}/event-admins`,
          newAdmin
        )
        .then((response) => {
          setAdmins((prevAdmins) => [...prevAdmins, response.data.eventAdmin]);
          setOpenAddAdminDialog(false);
          setNewAdmin({
            name: "",
            email: "",
            permissions: {
              canCreate: false,
              canUpdate: false,
              canDelete: false,
              canManageTickets: false,
            },
          });

          Swal.fire({
            icon: "success",
            title: "Admin Added",
            text: "The admin has been successfully added to the system.",
          });
        })
        .catch((error) => {
          console.error("Error adding admin:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text:
              error.response?.data?.message ||
              "Error adding admin to the system.",
          });
        });
    }
  };

  // Assign Event to Admin
  const handleAssignEvent = () => {
    axios
      .post("http://localhost:4000/api/tanant/assign-event", {
        tenantId: tenantId,
        adminId: selectedAdmin,
        eventId: selectedEventId,
      })
      .then((response) => {
        setOpenAssignEventDialog(false);

        Swal.fire({
          icon: "success",
          title: "Event Assigned",
          text: "The event has been successfully assigned to the admin.",
        });
      })
      .catch((error) => {
        console.error("Error assigning event:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.response?.data?.message ||
            "Error assigning event to the admin.",
        });
      });
  };

  return (
    <div>
      <h2 style={{ marginBottom: "10px" }}>Tenant Admins and Events</h2>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenAddAdminDialog(true)}
        style={{ marginRight: "10px" }}
      >
        Add Admin
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => setOpenAssignEventDialog(true)}
      >
        Assign Admin to Event
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Event Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedData.length > 0 ? (
              displayedData.map((admin) =>
                admin.assignedEvents.map((event) => (
                  <TableRow key={event._id}>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{event.description}</TableCell>
                    <TableCell>
                      {new Date(event.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{event.time}</TableCell>
                  </TableRow>
                ))
              )
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={admins.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Add Admin Dialog */}
      <Dialog
        open={openAddAdminDialog}
        onClose={() => setOpenAddAdminDialog(false)}
      >
        <DialogTitle>Add Event Admin</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={newAdmin.name}
            onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            value={newAdmin.email}
            onChange={(e) =>
              setNewAdmin({ ...newAdmin, email: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Permissions</InputLabel>
            <Select
              multiple
              value={Object.keys(newAdmin.permissions).filter(
                (permission) => newAdmin.permissions[permission]
              )}
              onChange={(e) =>
                setNewAdmin({
                  ...newAdmin,
                  permissions: {
                    canCreate: e.target.value.includes("canCreate"),
                    canUpdate: e.target.value.includes("canUpdate"),
                    canDelete: e.target.value.includes("canDelete"),
                    canManageTickets:
                      e.target.value.includes("canManageTickets"),
                  },
                })
              }
            >
              <MenuItem value="canCreate">Create</MenuItem>
              <MenuItem value="canUpdate">Update</MenuItem>
              <MenuItem value="canDelete">Delete</MenuItem>
              <MenuItem value="canManageTickets">Manage Tickets</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddAdminDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddAdmin} color="primary">
            Add Admin
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Event Dialog */}
      <Dialog
        open={openAssignEventDialog}
        onClose={() => setOpenAssignEventDialog(false)}
        fullWidth
      >
        <DialogTitle>Assign Admin to Event</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Admin</InputLabel>
            <Select
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
              label="Select Admin"
            >
              {admins.map((admin) => (
                <MenuItem key={admin._id} value={admin._id}>
                  {admin.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Event</InputLabel>
            <Select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              label="Select Event"
            >
              {eventData.map((event) => (
                <MenuItem key={event._id} value={event._id}>
                  {event.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenAssignEventDialog(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={handleAssignEvent} color="primary">
            Assign Event
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TenantAdminTable;
