import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe("pk_test_51BTUDGJAJfZb9HEBwDg86TN1KNprHjkfipXmEDMb0gSCassK5T3ZfxsAbcgKVmAIXF7oZ6ItlZZbXO6idTHE67IM007EwQ4uN3");

const PaymentForm = ({ clientSecret, booking }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `http://localhost:3000/booking-confirmation/${booking._id}`,
      },
      redirect: "if_required"
    });

    if (error) {
      setError(error.message);
      setProcessing(false);
    } else if (paymentIntent.status === "succeeded") {
      // Confirm booking payment on backend
      try {
        await axios.post(`/api/bookings/${booking._id}/confirm-payment`, {
          paymentIntentId: paymentIntent.id
        });
        // Redirect to confirmation page
        window.location.href = `/booking-confirmation/${booking._id}`;
      } catch (confirmError) {
        setError("Payment confirmation failed");
      }
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <div>{error}</div>}
      <button disabled={processing || !stripe}>
        {processing ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
};

const StripePaymentPage = () => {
  const [clientSecret, setClientSecret] = useState(null);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const bookingResponse = await axios.get("/api/bookings/latest");
        setBooking(bookingResponse.data);
        
        const paymentResponse = await axios.post("/api/bookings/create-payment-intent", {
          bookingId: bookingResponse.data._id
        });
        
        setClientSecret(paymentResponse.data.clientSecret);
      } catch (error) {
        console.error("Payment setup failed", error);
      }
    };

    fetchPaymentDetails();
  }, []);

  const appearance = {
    theme: 'stripe'
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div>
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm 
            clientSecret={clientSecret} 
            booking={booking} 
          />
        </Elements>
      )}
    </div>
  );
};

export default StripePaymentPage;