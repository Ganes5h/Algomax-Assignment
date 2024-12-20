// import React, { useState } from "react";
// import {
//   Box,
//   TextField,
//   Button,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Typography,
//   Paper,
//   Grid,
//   Container,
//   FormControlLabel,
//   Switch,
// } from "@mui/material";
// // import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { DatePicker, TimePicker } from "@mui/x-date-pickers";

// import Swal from "sweetalert2";

// const EventCreationForm = () => {
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     poster: null,
//     managedBy: "67533d6cae408d900db763e4",
//     location: {
//       venue: "",
//       address: "",
//       city: "",
//       country: "",
//     },
//     date: null,
//     time: null,
//     category: "",
//     ticketDetails: {
//       totalTickets: "",
//       availableTickets: "",
//       pricing: [
//         {
//           type: "Standard",
//           price: "",
//           quantity: "",
//           availableQuantity: "",
//         },
//       ],
//       currency: "USD",
//     },
//     bankDetails: {
//       accountHolderName: "",
//       accountNumber: "",
//       routingNumber: "",
//       currency: "USD",
//       country: "US",
//     },
//     privateEvent: false,
//     status: "",
//   });

//   const categories = [
//     "Conference",
//     "Workshop",
//     "Seminar",
//     "Concert",
//     "Festival",
//     "Sports",
//     "Exhibition",
//     "Networking",
//     "Other",
//   ];

//   const currencies = ["USD", "EUR", "GBP", "CAD", "AUD"];
//   const countries = ["US", "CA", "GB", "AU", "EU"];

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleLocationChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       location: {
//         ...prev.location,
//         [name]: value,
//       },
//     }));
//   };

//   const handleBankDetailsChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       bankDetails: {
//         ...prev.bankDetails,
//         [name]: value,
//       },
//     }));
//   };

//   const handleTicketDetailsChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       ticketDetails: {
//         ...prev.ticketDetails,
//         [name]: value,
//       },
//     }));
//   };

//   const handlePricingChange = (index, field, value) => {
//     setFormData((prev) => {
//       const newPricing = [...prev.ticketDetails.pricing];
//       newPricing[index] = {
//         ...newPricing[index],
//         [field]: value,
//       };
//       return {
//         ...prev,
//         ticketDetails: {
//           ...prev.ticketDetails,
//           pricing: newPricing,
//         },
//       };
//     });
//   };

//   const handleFileChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       poster: e.target.files[0],
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const formDataToSend = new FormData();
//     Object.keys(formData).forEach((key) => {
//       if (key === "poster") {
//         if (formData.poster) {
//           formDataToSend.append("poster", formData.poster);
//         }
//       } else if (
//         key === "location" ||
//         key === "ticketDetails" ||
//         key === "bankDetails"
//       ) {
//         formDataToSend.append(key, JSON.stringify(formData[key]));
//       } else {
//         formDataToSend.append(key, formData[key]);
//       }
//     });

//     try {
//       const response = await fetch("http://localhost:4000/api/events/create", {
//         method: "POST",
//         body: formDataToSend,
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Swal.fire({
//           title: "Success!",
//           text: "Event created successfully",
//           icon: "success",
//         });
//       } else {
//         throw new Error(data.error || "Something went wrong");
//       }
//     } catch (error) {
//       Swal.fire({
//         title: "Error!",
//         text: error.message,
//         icon: "error",
//       });
//     }
//   };

//   return (
//     <Container maxWidth="md">
//       <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
//         <Typography variant="h4" gutterBottom>
//           Create New Event
//         </Typography>
//         <form onSubmit={handleSubmit}>
//           <Grid container spacing={3}>
//             {/* Basic Details */}
//             <Grid item xs={12}>
//               <Typography variant="h6" gutterBottom>
//                 Basic Details
//               </Typography>
//               <TextField
//                 fullWidth
//                 label="Title"
//                 name="title"
//                 value={formData.title}
//                 onChange={handleChange}
//                 required
//                 margin="normal"
//               />
//               <TextField
//                 fullWidth
//                 label="Description"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 required
//                 multiline
//                 rows={4}
//                 margin="normal"
//               />
//               <input
//                 accept="image/*"
//                 type="file"
//                 onChange={handleFileChange}
//                 style={{ marginTop: "1rem" }}
//               />
//             </Grid>

//             {/* Location Details */}
//             <Grid item xs={12}>
//               <Typography variant="h6" gutterBottom>
//                 Location Details
//               </Typography>
//               <Grid container spacing={2}>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label="Venue"
//                     name="venue"
//                     value={formData.location.venue}
//                     onChange={handleLocationChange}
//                     margin="normal"
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label="Address"
//                     name="address"
//                     value={formData.location.address}
//                     onChange={handleLocationChange}
//                     margin="normal"
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label="City"
//                     name="city"
//                     value={formData.location.city}
//                     onChange={handleLocationChange}
//                     margin="normal"
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label="Country"
//                     name="country"
//                     value={formData.location.country}
//                     onChange={handleLocationChange}
//                     margin="normal"
//                   />
//                 </Grid>
//               </Grid>
//             </Grid>

//             {/* Date and Time */}
//             <Grid item xs={12}>
//               <Typography variant="h6" gutterBottom>
//                 Date and Time
//               </Typography>
//               <Grid container spacing={2}>
//                 <Grid item xs={12} sm={6}>
//                   <div className="flex flex-col mb-4">
//                     <label
//                       htmlFor="event-date"
//                       className="text-sm font-medium text-gray-700 mb-2"
//                     >
//                       Event Date
//                     </label>
//                     <input
//                       type="date"
//                       id="event-date"
//                       value={formData.date}
//                       onChange={(e) =>
//                         setFormData((prev) => ({
//                           ...prev,
//                           date: e.target.value,
//                         }))
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <div className="flex flex-col mb-4">
//                     <label
//                       htmlFor="event-time"
//                       className="text-sm font-medium text-gray-700 mb-2"
//                     >
//                       Event Time
//                     </label>
//                     <input
//                       type="time"
//                       id="event-time"
//                       value={formData.time}
//                       onChange={(e) =>
//                         setFormData((prev) => ({
//                           ...prev,
//                           time: e.target.value,
//                         }))
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                 </Grid>
//               </Grid>
//             </Grid>

//             {/* Category */}
//             <Grid item xs={12}>
//               <FormControl fullWidth margin="normal">
//                 <InputLabel>Category</InputLabel>
//                 <Select
//                   name="category"
//                   value={formData.category}
//                   onChange={handleChange}
//                   label="Category"
//                 >
//                   {categories.map((category) => (
//                     <MenuItem key={category} value={category}>
//                       {category}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             {/* Ticket Details */}
//             <Grid item xs={12}>
//               <Typography variant="h6" gutterBottom>
//                 Ticket Details
//               </Typography>
//               <Grid container spacing={2}>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     type="number"
//                     label="Total Tickets"
//                     name="totalTickets"
//                     value={formData.ticketDetails.totalTickets}
//                     onChange={handleTicketDetailsChange}
//                     margin="normal"
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     type="number"
//                     label="Available Tickets"
//                     name="availableTickets"
//                     value={formData.ticketDetails.availableTickets}
//                     onChange={handleTicketDetailsChange}
//                     margin="normal"
//                   />
//                 </Grid>

//                 {/* Standard Ticket Section */}
//                 <Grid item xs={12}>
//                   <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
//                     Standard Tickets
//                   </Typography>
//                   <Grid container spacing={2}>
//                     <Grid item xs={12} sm={4}>
//                       <TextField
//                         fullWidth
//                         type="number"
//                         label="Price"
//                         value={
//                           formData.ticketDetails.pricing.find(
//                             (p) => p.type === "Standard"
//                           )?.price || ""
//                         }
//                         onChange={(e) =>
//                           handlePricingChange(
//                             "Standard",
//                             "price",
//                             e.target.value
//                           )
//                         }
//                         margin="normal"
//                       />
//                     </Grid>
//                     <Grid item xs={12} sm={4}>
//                       <TextField
//                         fullWidth
//                         type="number"
//                         label="Quantity"
//                         value={
//                           formData.ticketDetails.pricing.find(
//                             (p) => p.type === "Standard"
//                           )?.quantity || ""
//                         }
//                         onChange={(e) =>
//                           handlePricingChange(
//                             "Standard",
//                             "quantity",
//                             e.target.value
//                           )
//                         }
//                         margin="normal"
//                       />
//                     </Grid>
//                     <Grid item xs={12} sm={4}>
//                       <TextField
//                         fullWidth
//                         type="number"
//                         label="Available Quantity"
//                         value={
//                           formData.ticketDetails.pricing.find(
//                             (p) => p.type === "Standard"
//                           )?.availableQuantity || ""
//                         }
//                         onChange={(e) =>
//                           handlePricingChange(
//                             "Standard",
//                             "availableQuantity",
//                             e.target.value
//                           )
//                         }
//                         margin="normal"
//                       />
//                     </Grid>
//                   </Grid>
//                 </Grid>

//                 {/* VIP Ticket Section */}
//                 <Grid item xs={12}>
//                   <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
//                     VIP Tickets
//                   </Typography>
//                   <Grid container spacing={2}>
//                     <Grid item xs={12} sm={4}>
//                       <TextField
//                         fullWidth
//                         type="number"
//                         label="Price"
//                         value={
//                           formData.ticketDetails.pricing.find(
//                             (p) => p.type === "VIP"
//                           )?.price || ""
//                         }
//                         onChange={(e) =>
//                           handlePricingChange("VIP", "price", e.target.value)
//                         }
//                         margin="normal"
//                       />
//                     </Grid>
//                     <Grid item xs={12} sm={4}>
//                       <TextField
//                         fullWidth
//                         type="number"
//                         label="Quantity"
//                         value={
//                           formData.ticketDetails.pricing.find(
//                             (p) => p.type === "VIP"
//                           )?.quantity || ""
//                         }
//                         onChange={(e) =>
//                           handlePricingChange("VIP", "quantity", e.target.value)
//                         }
//                         margin="normal"
//                       />
//                     </Grid>
//                     <Grid item xs={12} sm={4}>
//                       <TextField
//                         fullWidth
//                         type="number"
//                         label="Available Quantity"
//                         value={
//                           formData.ticketDetails.pricing.find(
//                             (p) => p.type === "VIP"
//                           )?.availableQuantity || ""
//                         }
//                         onChange={(e) =>
//                           handlePricingChange(
//                             "VIP",
//                             "availableQuantity",
//                             e.target.value
//                           )
//                         }
//                         margin="normal"
//                       />
//                     </Grid>
//                   </Grid>
//                 </Grid>

//                 <Grid item xs={12}>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Currency</InputLabel>
//                     <Select
//                       name="currency"
//                       value={formData.ticketDetails.currency}
//                       onChange={handleTicketDetailsChange}
//                       label="Currency"
//                     >
//                       {currencies.map((currency) => (
//                         <MenuItem key={currency} value={currency}>
//                           {currency}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Grid>
//               </Grid>
//             </Grid>

//             {/* Bank Details */}
//             <Grid item xs={12}>
//               <Typography variant="h6" gutterBottom>
//                 Bank Details
//               </Typography>
//               <Grid container spacing={2}>
//                 <Grid item xs={12}>
//                   <TextField
//                     fullWidth
//                     label="Account Holder Name"
//                     name="accountHolderName"
//                     value={formData.bankDetails.accountHolderName}
//                     onChange={handleBankDetailsChange}
//                     margin="normal"
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label="Account Number"
//                     name="accountNumber"
//                     value={formData.bankDetails.accountNumber}
//                     onChange={handleBankDetailsChange}
//                     margin="normal"
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label="Routing Number"
//                     name="routingNumber"
//                     value={formData.bankDetails.routingNumber}
//                     onChange={handleBankDetailsChange}
//                     margin="normal"
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Currency</InputLabel>
//                     <Select
//                       name="currency"
//                       value={formData.bankDetails.currency}
//                       onChange={handleBankDetailsChange}
//                       label="Currency"
//                     >
//                       {currencies.map((currency) => (
//                         <MenuItem key={currency} value={currency}>
//                           {currency}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Country</InputLabel>
//                     <Select
//                       name="country"
//                       value={formData.bankDetails.country}
//                       onChange={handleBankDetailsChange}
//                       label="Country"
//                     >
//                       {countries.map((country) => (
//                         <MenuItem key={country} value={country}>
//                           {country}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Grid>
//               </Grid>
//             </Grid>

//             {/* Event Settings */}

//             <Grid item xs={12}>
//               <Typography variant="h6" gutterBottom>
//                 Event Settings
//               </Typography>
//               <div className="flex flex-col mb-4 w-full sm:w-1/2">
//                 <label
//                   htmlFor="status"
//                   className="text-sm font-medium text-gray-700 mb-2"
//                 >
//                   Event Status
//                 </label>
//                 <select
//                   id="status"
//                   name="status"
//                   value={formData.status}
//                   onChange={(e) =>
//                     setFormData((prev) => ({ ...prev, status: e.target.value }))
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   {["draft", "published", "cancelled"].map((status) => (
//                     <option key={status} value={status}>
//                       {status.charAt(0).toUpperCase() + status.slice(1)}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <FormControlLabel
//                 control={
//                   <Switch
//                     checked={formData.privateEvent}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         privateEvent: e.target.checked,
//                       }))
//                     }
//                   />
//                 }
//                 label="Private Event"
//               />
//             </Grid>

//             {/* Submit Button */}
//             <Grid item xs={12}>
//               <Button
//                 type="submit"
//                 variant="contained"
//                 color="primary"
//                 size="large"
//                 sx={{ mt: 3 }}
//                 fullWidth
//               >
//                 Create Event
//               </Button>
//             </Grid>
//           </Grid>
//         </form>
//       </Paper>
//     </Container>
//   );
// };

// export default EventCreationForm;

// import React, { useState } from "react";
// import {
//   Box,
//   TextField,
//   Button,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Typography,
//   Paper,
//   Grid,
//   Container,
//   FormControlLabel,
//   Switch,
// } from "@mui/material";
// // import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { DatePicker, TimePicker } from "@mui/x-date-pickers";

// import Swal from "sweetalert2";

// const EventCreationForm = () => {
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     poster: null,
//     managedBy: "67533d6cae408d900db763e4",
//     location: {
//       venue: "",
//       address: "",
//       city: "",
//       country: "",
//     },
//     date: null,
//     time: null,
//     category: "",
//     ticketDetails: {
//       totalTickets: "",
//       availableTickets: "",
//       pricing: [
//         {
//           type: "Standard",
//           price: "",
//           quantity: "",
//           availableQuantity: "",
//         },
//       ],
//       currency: "USD",
//     },
//     bankDetails: {
//       accountHolderName: "",
//       accountNumber: "",
//       routingNumber: "",
//       currency: "USD",
//       country: "US",
//     },
//     privateEvent: false,
//     status: "",
//   });

//   const categories = [
//     "Conference",
//     "Workshop",
//     "Seminar",
//     "Concert",
//     "Festival",
//     "Sports",
//     "Exhibition",
//     "Networking",
//     "Other",
//   ];

//   const currencies = ["USD", "EUR", "GBP", "CAD", "AUD"];
//   const countries = ["US", "CA", "GB", "AU", "EU"];

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleLocationChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       location: {
//         ...prev.location,
//         [name]: value,
//       },
//     }));
//   };

//   const handleBankDetailsChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       bankDetails: {
//         ...prev.bankDetails,
//         [name]: value,
//       },
//     }));
//   };

//   const handleTicketDetailsChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       ticketDetails: {
//         ...prev.ticketDetails,
//         [name]: value,
//       },
//     }));
//   };

//   const handlePricingChange = (index, field, value) => {
//     setFormData((prev) => {
//       const newPricing = [...prev.ticketDetails.pricing];
//       newPricing[index] = {
//         ...newPricing[index],
//         [field]: value,
//       };
//       return {
//         ...prev,
//         ticketDetails: {
//           ...prev.ticketDetails,
//           pricing: newPricing,
//         },
//       };
//     });
//   };

//   const handleFileChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       poster: e.target.files[0],
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const formDataToSend = new FormData();
//     Object.keys(formData).forEach((key) => {
//       if (key === "poster") {
//         if (formData.poster) {
//           formDataToSend.append("poster", formData.poster);
//         }
//       } else if (
//         key === "location" ||
//         key === "ticketDetails" ||
//         key === "bankDetails"
//       ) {
//         formDataToSend.append(key, JSON.stringify(formData[key]));
//       } else {
//         formDataToSend.append(key, formData[key]);
//       }
//     });

//     try {
//       const response = await fetch("http://localhost:4000/api/events/create", {
//         method: "POST",
//         body: formDataToSend,
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Swal.fire({
//           title: "Success!",
//           text: "Event created successfully",
//           icon: "success",
//         });
//       } else {
//         throw new Error(data.error || "Something went wrong");
//       }
//     } catch (error) {
//       Swal.fire({
//         title: "Error!",
//         text: error.message,
//         icon: "error",
//       });
//     }
//   };

//   return (
//     <Container maxWidth="md">
//       <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
//         <Typography variant="h4" gutterBottom>
//           Create New Event
//         </Typography>
//         <form onSubmit={handleSubmit}>
//           <Grid container spacing={3}>
//             {/* Basic Details */}
//             <Grid item xs={12}>
//               <Typography variant="h6" gutterBottom>
//                 Basic Details
//               </Typography>
//               <TextField
//                 fullWidth
//                 label="Title"
//                 name="title"
//                 value={formData.title}
//                 onChange={handleChange}
//                 required
//                 margin="normal"
//               />
//               <TextField
//                 fullWidth
//                 label="Description"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 required
//                 multiline
//                 rows={4}
//                 margin="normal"
//               />
//               <input
//                 accept="image/*"
//                 type="file"
//                 onChange={handleFileChange}
//                 style={{ marginTop: "1rem" }}
//               />
//             </Grid>

//             {/* Location Details */}
//             <Grid item xs={12}>
//               <Typography variant="h6" gutterBottom>
//                 Location Details
//               </Typography>
//               <Grid container spacing={2}>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label="Venue"
//                     name="venue"
//                     value={formData.location.venue}
//                     onChange={handleLocationChange}
//                     margin="normal"
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label="Address"
//                     name="address"
//                     value={formData.location.address}
//                     onChange={handleLocationChange}
//                     margin="normal"
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label="City"
//                     name="city"
//                     value={formData.location.city}
//                     onChange={handleLocationChange}
//                     margin="normal"
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label="Country"
//                     name="country"
//                     value={formData.location.country}
//                     onChange={handleLocationChange}
//                     margin="normal"
//                   />
//                 </Grid>
//               </Grid>
//             </Grid>

//             {/* Date and Time */}
//             <Grid item xs={12}>
//               <Typography variant="h6" gutterBottom>
//                 Date and Time
//               </Typography>
//               <Grid container spacing={2}>
//                 <Grid item xs={12} sm={6}>
//                   <div className="flex flex-col mb-4">
//                     <label
//                       htmlFor="event-date"
//                       className="text-sm font-medium text-gray-700 mb-2"
//                     >
//                       Event Date
//                     </label>
//                     <input
//                       type="date"
//                       id="event-date"
//                       value={formData.date}
//                       onChange={(e) =>
//                         setFormData((prev) => ({
//                           ...prev,
//                           date: e.target.value,
//                         }))
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <div className="flex flex-col mb-4">
//                     <label
//                       htmlFor="event-time"
//                       className="text-sm font-medium text-gray-700 mb-2"
//                     >
//                       Event Time
//                     </label>
//                     <input
//                       type="time"
//                       id="event-time"
//                       value={formData.time}
//                       onChange={(e) =>
//                         setFormData((prev) => ({
//                           ...prev,
//                           time: e.target.value,
//                         }))
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                 </Grid>
//               </Grid>
//             </Grid>

//             {/* Category */}
//             <Grid item xs={12}>
//               <FormControl fullWidth margin="normal">
//                 <InputLabel>Category</InputLabel>
//                 <Select
//                   name="category"
//                   value={formData.category}
//                   onChange={handleChange}
//                   label="Category"
//                 >
//                   {categories.map((category) => (
//                     <MenuItem key={category} value={category}>
//                       {category}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             {/* Ticket Details */}
//             <Grid item xs={12}>
//               <Typography variant="h6" gutterBottom>
//                 Ticket Details
//               </Typography>
//               <Grid container spacing={2}>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     type="number"
//                     label="Total Tickets"
//                     name="totalTickets"
//                     value={formData.ticketDetails.totalTickets}
//                     onChange={handleTicketDetailsChange}
//                     margin="normal"
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     type="number"
//                     label="Available Tickets"
//                     name="availableTickets"
//                     value={formData.ticketDetails.availableTickets}
//                     onChange={handleTicketDetailsChange}
//                     margin="normal"
//                   />
//                 </Grid>

//                 {/* Standard Ticket Section */}
//                 <Grid item xs={12}>
//                   <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
//                     Standard Tickets
//                   </Typography>
//                   <Grid container spacing={2}>
//                     <Grid item xs={12} sm={4}>
//                       <TextField
//                         fullWidth
//                         type="number"
//                         label="Price"
//                         value={
//                           formData.ticketDetails.pricing.find(
//                             (p) => p.type === "Standard"
//                           )?.price || ""
//                         }
//                         onChange={(e) =>
//                           handlePricingChange(
//                             "Standard",
//                             "price",
//                             e.target.value
//                           )
//                         }
//                         margin="normal"
//                       />
//                     </Grid>
//                     <Grid item xs={12} sm={4}>
//                       <TextField
//                         fullWidth
//                         type="number"
//                         label="Quantity"
//                         value={
//                           formData.ticketDetails.pricing.find(
//                             (p) => p.type === "Standard"
//                           )?.quantity || ""
//                         }
//                         onChange={(e) =>
//                           handlePricingChange(
//                             "Standard",
//                             "quantity",
//                             e.target.value
//                           )
//                         }
//                         margin="normal"
//                       />
//                     </Grid>
//                     <Grid item xs={12} sm={4}>
//                       <TextField
//                         fullWidth
//                         type="number"
//                         label="Available Quantity"
//                         value={
//                           formData.ticketDetails.pricing.find(
//                             (p) => p.type === "Standard"
//                           )?.availableQuantity || ""
//                         }
//                         onChange={(e) =>
//                           handlePricingChange(
//                             "Standard",
//                             "availableQuantity",
//                             e.target.value
//                           )
//                         }
//                         margin="normal"
//                       />
//                     </Grid>
//                   </Grid>
//                 </Grid>

//                 {/* VIP Ticket Section */}
//                 <Grid item xs={12}>
//                   <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
//                     VIP Tickets
//                   </Typography>
//                   <Grid container spacing={2}>
//                     <Grid item xs={12} sm={4}>
//                       <TextField
//                         fullWidth
//                         type="number"
//                         label="Price"
//                         value={
//                           formData.ticketDetails.pricing.find(
//                             (p) => p.type === "VIP"
//                           )?.price || ""
//                         }
//                         onChange={(e) =>
//                           handlePricingChange("VIP", "price", e.target.value)
//                         }
//                         margin="normal"
//                       />
//                     </Grid>
//                     <Grid item xs={12} sm={4}>
//                       <TextField
//                         fullWidth
//                         type="number"
//                         label="Quantity"
//                         value={
//                           formData.ticketDetails.pricing.find(
//                             (p) => p.type === "VIP"
//                           )?.quantity || ""
//                         }
//                         onChange={(e) =>
//                           handlePricingChange("VIP", "quantity", e.target.value)
//                         }
//                         margin="normal"
//                       />
//                     </Grid>
//                     <Grid item xs={12} sm={4}>
//                       <TextField
//                         fullWidth
//                         type="number"
//                         label="Available Quantity"
//                         value={
//                           formData.ticketDetails.pricing.find(
//                             (p) => p.type === "VIP"
//                           )?.availableQuantity || ""
//                         }
//                         onChange={(e) =>
//                           handlePricingChange(
//                             "VIP",
//                             "availableQuantity",
//                             e.target.value
//                           )
//                         }
//                         margin="normal"
//                       />
//                     </Grid>
//                   </Grid>
//                 </Grid>

//                 <Grid item xs={12}>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Currency</InputLabel>
//                     <Select
//                       name="currency"
//                       value={formData.ticketDetails.currency}
//                       onChange={handleTicketDetailsChange}
//                       label="Currency"
//                     >
//                       {currencies.map((currency) => (
//                         <MenuItem key={currency} value={currency}>
//                           {currency}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Grid>
//               </Grid>
//             </Grid>

//             {/* Bank Details */}
//             <Grid item xs={12}>
//               <Typography variant="h6" gutterBottom>
//                 Bank Details
//               </Typography>
//               <Grid container spacing={2}>
//                 <Grid item xs={12}>
//                   <TextField
//                     fullWidth
//                     label="Account Holder Name"
//                     name="accountHolderName"
//                     value={formData.bankDetails.accountHolderName}
//                     onChange={handleBankDetailsChange}
//                     margin="normal"
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label="Account Number"
//                     name="accountNumber"
//                     value={formData.bankDetails.accountNumber}
//                     onChange={handleBankDetailsChange}
//                     margin="normal"
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label="Routing Number"
//                     name="routingNumber"
//                     value={formData.bankDetails.routingNumber}
//                     onChange={handleBankDetailsChange}
//                     margin="normal"
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Currency</InputLabel>
//                     <Select
//                       name="currency"
//                       value={formData.bankDetails.currency}
//                       onChange={handleBankDetailsChange}
//                       label="Currency"
//                     >
//                       {currencies.map((currency) => (
//                         <MenuItem key={currency} value={currency}>
//                           {currency}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Country</InputLabel>
//                     <Select
//                       name="country"
//                       value={formData.bankDetails.country}
//                       onChange={handleBankDetailsChange}
//                       label="Country"
//                     >
//                       {countries.map((country) => (
//                         <MenuItem key={country} value={country}>
//                           {country}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Grid>
//               </Grid>
//             </Grid>

//             {/* Event Settings */}

//             <Grid item xs={12}>
//               <Typography variant="h6" gutterBottom>
//                 Event Settings
//               </Typography>
//               <div className="flex flex-col mb-4 w-full sm:w-1/2">
//                 <label
//                   htmlFor="status"
//                   className="text-sm font-medium text-gray-700 mb-2"
//                 >
//                   Event Status
//                 </label>
//                 <select
//                   id="status"
//                   name="status"
//                   value={formData.status}
//                   onChange={(e) =>
//                     setFormData((prev) => ({ ...prev, status: e.target.value }))
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   {["draft", "published", "cancelled"].map((status) => (
//                     <option key={status} value={status}>
//                       {status.charAt(0).toUpperCase() + status.slice(1)}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <FormControlLabel
//                 control={
//                   <Switch
//                     checked={formData.privateEvent}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         privateEvent: e.target.checked,
//                       }))
//                     }
//                   />
//                 }
//                 label="Private Event"
//               />
//             </Grid>

//             {/* Submit Button */}
//             <Grid item xs={12}>
//               <Button
//                 type="submit"
//                 variant="contained"
//                 color="primary"
//                 size="large"
//                 sx={{ mt: 3 }}
//                 fullWidth
//               >
//                 Create Event
//               </Button>
//             </Grid>
//           </Grid>
//         </form>
//       </Paper>
//     </Container>
//   );
// };

// export default EventCreationForm;

import React, { useState } from "react";
import { Calendar, Clock, MapPin, Ticket, CreditCard } from "lucide-react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Paper } from "@mui/material";
import {
  TextField,
  Grid,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
// import { Ticket, CreditCard } from "@mui/icons-material";
const EventCreationForm = () => {
  // const tenantLogin = useSelector((state) => state.tenantLogin);
  const [tenant, setTenant] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    managedBy: "",
    poster: null,
    venue: "",
    city: "",
    country: "",
    date: "",
    time: "",
    category: "",
    totalTickets: 0,
    standardPrice: 0,
    standardQuantity: 0,
    vipPrice: 0,
    vipQuantity: 0,
    accountHolderName: "",
    accountNumber: "",
    routingNumber: "",
    bankCountry: "US",
    currency: "USD",
    status: "",
  });
  useEffect(() => {
    // Get the tenant data from localStorage
    const tenantData = localStorage.getItem("tenant");
    if (tenantData) {
      const parsedTenant = JSON.parse(tenantData);
      setTenant(parsedTenant);

      // Set managedBy in formData if tenant._id is available
      if (parsedTenant._id) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          managedBy: parsedTenant._id,
        }));
      }
    }
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      poster: e.target.files[0],
    }));
  };

  useEffect(() => {
    const standardQuantity = parseInt(formData.standardQuantity) || 0;
    const vipQuantity = parseInt(formData.vipQuantity) || 0;
    setFormData((prev) => ({
      ...prev,
      totalTickets: standardQuantity + vipQuantity,
    }));
  }, [formData.standardQuantity, formData.vipQuantity]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    // Basic event details
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("managedBy", formData.managedBy);
    formDataToSend.append("poster", formData.poster);
    formDataToSend.append("date", formData.date);
    formDataToSend.append("time", formData.time);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("status", formData.status);

    // Location object
    const location = {
      venue: formData.venue,
      city: formData.city,
      country: formData.country,
    };
    formDataToSend.append("location", JSON.stringify(location));

    // Ticket details object
    const ticketDetails = {
      totalTickets: parseInt(formData.totalTickets),
      availableTickets: parseInt(formData.totalTickets),
      currency: formData.currency,
      pricing: [
        {
          type: "Standard",
          price: parseFloat(formData.standardPrice),
          quantity: parseInt(formData.standardQuantity),
          availableQuantity: parseInt(formData.standardQuantity),
        },
      ],
    };

    if (formData.vipPrice > 0 && formData.vipQuantity > 0) {
      ticketDetails.pricing.push({
        type: "VIP",
        price: parseFloat(formData.vipPrice),
        quantity: parseInt(formData.vipQuantity),
        availableQuantity: parseInt(formData.vipQuantity),
      });
    }

    formDataToSend.append("ticketDetails", JSON.stringify(ticketDetails));

    // Bank details object
    const bankDetails = {
      accountHolderName: formData.accountHolderName,
      accountNumber: formData.accountNumber,
      routingNumber: formData.routingNumber,
      country: formData.bankCountry,
      currency: formData.currency,
    };
    formDataToSend.append("bankDetails", JSON.stringify(bankDetails));

    try {
      const response = await fetch("http://localhost:4000/api/events/create", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert("Event created successfully!");
    } catch (error) {
      alert("Error creating event: " + error.message);
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: "800px", margin: "auto", padding: 4 }}>
      <form onSubmit={handleSubmit}>
        {/* Basic Details */}
        <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          Basic Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Event Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              multiline
              rows={4}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{ marginTop: 1 }}
            >
              Upload Poster
              <input
                type="file"
                name="poster"
                onChange={handleFileChange}
                hidden
                required
              />
            </Button>
          </Grid>
        </Grid>

        {/* Location */}
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", marginTop: 4, marginBottom: 2 }}
        >
          <MapPin sx={{ fontSize: 20, marginRight: 1 }} />
          Location
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Venue"
              name="venue"
              value={formData.venue}
              onChange={handleInputChange}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
              variant="outlined"
            />
          </Grid>
        </Grid>

        {/* Date and Time */}
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", marginTop: 4, marginBottom: 2 }}
        >
          <Calendar sx={{ fontSize: 20, marginRight: 1 }} />
          Date and Time
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Event Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Event Time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleInputChange}
              required
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>

        {/* Ticket Details */}
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", marginTop: 4, marginBottom: 2 }}
        >
          <Ticket sx={{ fontSize: 20, marginRight: 1 }} />
          Ticket Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Standard Ticket Price ($)"
              name="standardPrice"
              type="number"
              value={formData.standardPrice}
              onChange={handleInputChange}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Standard Ticket Quantity"
              name="standardQuantity"
              type="number"
              value={formData.standardQuantity}
              onChange={handleInputChange}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="VIP Ticket Price ($)"
              name="vipPrice"
              type="number"
              value={formData.vipPrice}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="VIP Ticket Quantity"
              name="vipQuantity"
              type="number"
              value={formData.vipQuantity}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Total Tickets (Calculated)"
              name="totalTickets"
              type="number"
              value={formData.totalTickets}
              readOnly
              variant="outlined"
              InputProps={{
                readOnly: true,
                style: { backgroundColor: "#f5f5f5" },
              }}
            />
          </Grid>
        </Grid>

        {/* Bank Details */}
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", marginTop: 4, marginBottom: 2 }}
        >
          <CreditCard sx={{ fontSize: 20, marginRight: 1 }} />
          Bank Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Account Holder Name"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleInputChange}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Account Number"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Routing Number"
              name="routingNumber"
              value={formData.routingNumber}
              onChange={handleInputChange}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel>Currency</InputLabel>
              <Select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                label="Currency"
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="CAD">CAD</MenuItem>
                <MenuItem value="AUD">AUD</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                label="Category"
              >
                <MenuItem value="Conference">Conference</MenuItem>
                <MenuItem value="Workshop">Workshop</MenuItem>
                <MenuItem value="Seminar">Seminar</MenuItem>
                <MenuItem value="Concert">Concert</MenuItem>
                <MenuItem value="Festival">Festival</MenuItem>
                <MenuItem value="Sports">Sports</MenuItem>
                <MenuItem value="Exhibition">Exhibition</MenuItem>
                <MenuItem value="Networking">Networking</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Status"
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        {/* Submit Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          type="submit"
          sx={{ marginTop: 4 }}
        >
          Create Event
        </Button>
      </form>
    </Paper>
  );
};

export default EventCreationForm;
