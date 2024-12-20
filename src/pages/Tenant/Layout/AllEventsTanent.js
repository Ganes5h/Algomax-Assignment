import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import axios from "axios";

const EventTable = () => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tenantData = localStorage.getItem("tenant");
    if (tenantData) {
      const parsedTenant = JSON.parse(tenantData);
      setTenant(parsedTenant);

      if (parsedTenant._id) {
        // Fetch events data from the API
        axios
          .get(
            `http://localhost:4000/api/tanant/tenant-events/${parsedTenant._id}`
          )
          .then((response) => {
            setEvents(response.data.events || []);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching events:", error);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (event) => {
    setSelectedEvent(event);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  return (
    <div>
      {loading ? (
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          Loading events...
        </Typography>
      ) : events.length === 0 ? (
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          No events available.
        </Typography>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((event) => (
                    <TableRow key={event._id}>
                      <TableCell>{event.title}</TableCell>
                      <TableCell>
                        {event.location.venue}, {event.location.city},{" "}
                        {event.location.country}
                      </TableCell>
                      <TableCell>
                        {new Date(event.date).toLocaleString()}
                      </TableCell>
                      <TableCell>{event.category}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleOpenDialog(event)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={events.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* Dialog for event details */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <div>
              <Typography variant="h6">Title: {selectedEvent.title}</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                <strong>Description:</strong> {selectedEvent.description}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                <strong>Location:</strong> {selectedEvent.location.venue},{" "}
                {selectedEvent.location.city}, {selectedEvent.location.country}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                <strong>Bank Details:</strong> Account Holder:{" "}
                {selectedEvent.bankDetails.accountHolderName}, Account Number:{" "}
                {selectedEvent.bankDetails.accountNumber}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                <strong>Ticket Pricing:</strong>
                <ul>
                  {selectedEvent.ticketDetails.pricing.map((ticket) => (
                    <li key={ticket._id}>
                      {ticket.type} - {ticket.price}{" "}
                      {selectedEvent.ticketDetails.currency}
                    </li>
                  ))}
                </ul>
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleCloseDialog}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EventTable;
