import React, { useState, useEffect } from "react";

// Chart.js Imports
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  TimeScale,
  PointElement,
  LineElement,
  PieController,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Pie, Bar, Line } from "react-chartjs-2";

// Count Up Import
import CountUp from "react-countup";

// Material UI Imports
import { Card, CardContent, CardHeader, Typography } from "@mui/material";

// Lucide Icons
import { Activity, BookOpen, DollarSign, Users } from "lucide-react";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  TimeScale,
  PointElement,
  LineElement,
  PieController
);

const SuperAdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/superadmin/analytics`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setAnalytics(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Typography variant="h6">Loading...</Typography>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Typography variant="h6">No analytics data available</Typography>
      </div>
    );
  }

  // Pie Chart for Tenant Verification
  const tenantVerificationData = {
    labels: analytics.tenantVerificationPieChart.map((item) => item.status),
    datasets: [
      {
        data: analytics.tenantVerificationPieChart.map((item) => item.count),
        backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
      },
    ],
  };

  // Bar Chart for Event Categories
  const eventCategoryData = {
    labels: analytics.eventCategoryBarGraph.map((item) => item.category),
    datasets: [
      {
        label: "Number of Events",
        data: analytics.eventCategoryBarGraph.map((item) => item.count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  // Line Chart for Monthly Bookings
  const monthlyBookingsData = {
    labels: analytics.monthlyBookingsTrend.map(
      (item) => `${item.month}/${item.year}`
    ),
    datasets: [
      {
        label: "Booking Count",
        data: analytics.monthlyBookingsTrend.map((item) => item.bookingCount),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
      {
        label: "Total Revenue",
        data: analytics.monthlyBookingsTrend.map((item) => item.totalRevenue),
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Total Tenants */}
        <Card>
          <CardHeader
            title="Total Tenants"
            action={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          <CardContent>
            <Typography variant="h4" component="div">
              <CountUp end={analytics.countMetrics.totalTenants} duration={2} />
            </Typography>
          </CardContent>
        </Card>

        {/* Total Events */}
        <Card>
          <CardHeader
            title="Total Events"
            action={<BookOpen className="h-4 w-4 text-muted-foreground" />}
          />
          <CardContent>
            <Typography variant="h4" component="div">
              <CountUp end={analytics.countMetrics.totalEvents} duration={2} />
            </Typography>
          </CardContent>
        </Card>

        {/* Total Bookings */}
        <Card>
          <CardHeader
            title="Total Bookings"
            action={<Activity className="h-4 w-4 text-muted-foreground" />}
          />
          <CardContent>
            <Typography variant="h4" component="div">
              <CountUp
                end={analytics.countMetrics.totalBookings}
                duration={2}
              />
            </Typography>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader
            title="Total Revenue"
            action={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          />
          <CardContent>
            <Typography variant="h4" component="div">
              <CountUp
                end={analytics.countMetrics.totalRevenue}
                prefix="$"
                decimals={2}
                duration={2}
              />
            </Typography>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tenant Verification Status */}
        <Card>
          <CardHeader title="Tenant Verification Status" />
          <CardContent>
            <Pie data={tenantVerificationData} />
          </CardContent>
        </Card>

        {/* Event Categories */}
        <Card>
          <CardHeader title="Event Categories" />
          <CardContent>
            <Bar
              data={eventCategoryData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Monthly Bookings Trend */}
        <Card className="col-span-2">
          <CardHeader title="Monthly Bookings Trend" />
          <CardContent>
            <Line
              data={monthlyBookingsData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
