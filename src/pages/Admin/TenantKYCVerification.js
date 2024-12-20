import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Grid,
  Typography,
  Box,
} from "@mui/material";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

const TenantKYCVerification = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDocumentDialog, setOpenDocumentDialog] = useState(false);
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState("");
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [selectedAction, setSelectedAction] = useState(null);
  const { token, superAdmin } = useSelector((state) => state.superAdmin);

  const verificationNoteTemplates = {
    accepted: [
      "Documents are clear and meet all requirements.",
      "All information verified successfully.",
      "KYC process completed without issues.",
    ],
    rejected: [
      "Incomplete or unclear documentation.",
      "Discrepancies found in submitted documents.",
      "Additional information required.",
    ],
  };

  useEffect(() => {
    fetchPendingTenants();
  }, []);

  const fetchPendingTenants = () => {
    setLoading(true);
    axios
      .get("http://localhost:4000/api/tanant/getpendingkyc")
      .then((response) => {
        if (response.data.success) {
          setTenants(response.data.tenants);
        } else if (
          response.data.message ===
          "No tenants with pending KYC verification found."
        ) {
          setTenants([]); // Set to empty array
        } else {
          Swal.fire({
            title: "Error!",
            text: "Failed to load tenants",
            icon: "error",
            confirmButtonText: "Retry",
          });
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        // Only show error if it's not a "no data" scenario
        if (error.response && error.response.status !== 404) {
          Swal.fire({
            title: "Error!",
            text: "Error loading tenants",
            icon: "error",
            confirmButtonText: "Retry",
          });
        }
        setLoading(false);
      });
  };

  const handleViewDocument = (documentUrl) => {
    setSelectedDocumentUrl(documentUrl);
    setOpenDocumentDialog(true);
  };

  const handleTakeAction = (tenant) => {
    setSelectedTenant(tenant);
    setOpenActionDialog(true);
    setVerificationNotes("");
    setSelectedAction(null);
  };

  const handleVerifyTenant = () => {
    if (!selectedAction) {
      Swal.fire({
        title: "Error!",
        text: "Please select an action and provide notes.",
        icon: "error",
        confirmButtonText: "Okay",
      });
      return;
    }

    // Check if superAdminId is available
    if (!superAdmin || !superAdmin.id) {
      Swal.fire({
        title: "Error!",
        text: "SuperAdmin ID is missing. Please login again.",
        icon: "error",
        confirmButtonText: "Okay",
      });
      return;
    }

    // Ensure selectedTenant._id is available
    if (!selectedTenant || !selectedTenant._id) {
      Swal.fire({
        title: "Error!",
        text: "No tenant selected. Please select a tenant to verify.",
        icon: "error",
        confirmButtonText: "Okay",
      });
      return;
    }

    const payload = {
      superAdminId: superAdmin.id,
      verificationStatus: selectedAction,
      verificationNotes,
    };

    console.log("Payload being sent to API:", payload); // Debugging payload

    // Call the API to verify tenant KYC
    axios
      .post(
        `http://localhost:4000/api/tanant/verifyTenantKYC/${selectedTenant._id}`,
        payload
      )
      .then((response) => {
        console.log("Response from server:", response.data); // Debugging response
        // Check if the API response is successful
        if (
          response.data.message &&
          response.data.message.includes("Tenant KYC verified successfully.")
        ) {
          Swal.fire({
            title: "Success!",
            text: "KYC verification updated successfully.",
            icon: "success",
            confirmButtonText: "Okay",
          });

          // Refresh tenant list
          fetchPendingTenants();

          // Close dialogs
          setOpenActionDialog(false);
          setSelectedTenant(null);
        } else {
          Swal.fire({
            title: "Error!",
            text: response.data.message || "Failed to update KYC verification.",
            icon: "error",
            confirmButtonText: "Retry",
          });
        }
      })
      .catch((error) => {
        console.error(error);
        Swal.fire({
          title: "Error!",
          text: "Error verifying tenant. Please try again.",
          icon: "error",
          confirmButtonText: "Retry",
        });
      });
  };

  const handleCloseDialogs = () => {
    setOpenDocumentDialog(false);
    setOpenActionDialog(false);
    setSelectedTenant(null);
    setVerificationNotes("");
    setSelectedAction(null);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
        >
          <Typography variant="h6">Loading...</Typography>
        </Box>
      );
    }

    if (tenants.length === 0) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
        >
          <Typography variant="h6" color="textSecondary">
            No Pending KYC Verifications
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company Name</TableCell>
              <TableCell>Registration Number</TableCell>

              <TableCell>Document Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant._id}>
                <TableCell>{tenant.companyName}</TableCell>
                <TableCell>{tenant.registrationNumber}</TableCell>

                <TableCell>{tenant.documentType}</TableCell>
                <TableCell>
                  <Chip label="Pending" color="warning" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Grid container spacing={1}>
                    <Grid item>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() =>
                          handleViewDocument(tenant.documentUrls[0])
                        }
                      >
                        View Document
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleTakeAction(tenant)}
                      >
                        Take Action
                      </Button>
                    </Grid>
                  </Grid>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Tenant KYC Verification
      </Typography>

      {renderContent()}

      {/* Document View Dialog */}
      <Dialog
        open={openDocumentDialog}
        onClose={handleCloseDialogs}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>View Document</DialogTitle>
        <DialogContent>
          <img
            src={`http://localhost:4000${selectedDocumentUrl}`}
            alt="KYC Document"
            style={{ width: "100%", height: "auto" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Verification Action Dialog */}
      <Dialog
        open={openActionDialog}
        onClose={handleCloseDialogs}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Verify Tenant KYC</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} direction="column">
            <Grid item>
              <Typography variant="h6">
                Company: {selectedTenant?.companyName}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle1">
                Select Verification Status:
              </Typography>
              <Grid container spacing={1}>
                <Grid item>
                  <Chip
                    label="Accepted"
                    color="success"
                    variant={
                      selectedAction === "verified" ? "filled" : "outlined"
                    }
                    onClick={() => setSelectedAction("verified")}
                    clickable
                  />
                </Grid>
                <Grid item>
                  <Chip
                    label="Rejected"
                    color="error"
                    variant={
                      selectedAction === "rejected" ? "filled" : "outlined"
                    }
                    onClick={() => setSelectedAction("rejected")}
                    clickable
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Typography variant="subtitle1">Quick Notes:</Typography>
              <Grid container spacing={1}>
                {selectedAction &&
                  verificationNoteTemplates[
                    selectedAction === "verified" ? "accepted" : "rejected"
                  ].map((note, index) => (
                    <Grid item key={index}>
                      <Chip
                        label={note}
                        variant="outlined"
                        onClick={() => setVerificationNotes(note)}
                        clickable
                      />
                    </Grid>
                  ))}
              </Grid>
            </Grid>
            <Grid item>
              <TextField
                label="Verification Notes"
                multiline
                rows={4}
                variant="outlined"
                fullWidth
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Add additional notes here..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleVerifyTenant();
              handleCloseDialogs();
            }}
            color="primary"
            variant="contained"
            disabled={!selectedAction}
          >
            Confirm Action
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TenantKYCVerification;
