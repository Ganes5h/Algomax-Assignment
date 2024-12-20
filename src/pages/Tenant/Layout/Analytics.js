import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import CountUp from "react-countup";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import "chartjs-adapter-date-fns";

// Register chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);
const TenantStats = () => {
  const [tenantStats, setTenantStats] = useState(null);
  const [tenantDataUse, setTenantDataUse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tenantData = localStorage.getItem("tenant");
    if (tenantData) {
      const parsedTenantData = JSON.parse(tenantData);
      setTenantDataUse(parsedTenantData);
    }
  }, []);

  useEffect(() => {
    const fetchTenantStats = async () => {
      if (tenantDataUse && tenantDataUse._id) {
        try {
          const response = await axios.get(
            `http://localhost:4000/api/tanant/tenant-stats/${tenantDataUse._id}`
          );
          setTenantStats(response.data);
        } catch (error) {
          console.error("Error fetching tenant stats", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchTenantStats();
  }, [tenantDataUse]);

  if (loading) return <div>Loading...</div>;

  if (!tenantStats || tenantStats.length === 0) {
    return <div>No data available</div>;
  }

  const hasEventAnalytics = tenantStats.eventsAnalytics?.length > 0;

  // Prepare Bar Chart Data
  const barChartData = hasEventAnalytics
    ? {
        labels: tenantStats.eventsAnalytics.map((event) => event.title),
        datasets: [
          {
            label: "Revenue",
            data: tenantStats.eventsAnalytics.map(
              (event) => event.totalRevenue
            ),
            backgroundColor: "#4caf50",
          },
          {
            label: "Participants",
            data: tenantStats.eventsAnalytics.map(
              (event) => event.participantsCount
            ),
            backgroundColor: "#ff9800",
          },
        ],
      }
    : null;

  // Prepare Pie Chart Data
  const pieChartData = hasEventAnalytics
    ? {
        labels: ["Available Tickets", "Sold Tickets"],
        datasets: [
          {
            data: [
              tenantStats.eventsAnalytics[0].availableTickets || 0,
              (tenantStats.eventsAnalytics[0].totalTickets || 0) -
                (tenantStats.eventsAnalytics[0].availableTickets || 0),
            ],
            backgroundColor: ["#4caf50", "#ff9800"],
            hoverOffset: 4,
          },
        ],
      }
    : null;

  return (
    <Box sx={{ padding: 3 }}>
      {/* Cards Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: "center" }}>
            <CardContent>
              <Typography variant="h6">Total Revenue</Typography>
              <Typography variant="h4">
                <CountUp
                  start={0}
                  end={tenantStats.totalRevenue || 0}
                  duration={2}
                  separator=","
                />
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: "center" }}>
            <CardContent>
              <Typography variant="h6">Total Events</Typography>
              <Typography variant="h4">
                <CountUp
                  start={0}
                  end={tenantStats.totalEvents || 0}
                  duration={2}
                />
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: "center" }}>
            <CardContent>
              <Typography variant="h6">Total Participants</Typography>
              <Typography variant="h4">
                <CountUp
                  start={0}
                  end={tenantStats.totalParticipants || 0}
                  duration={2}
                />
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart Section */}
      <Grid container spacing={3} sx={{ marginTop: 4 }}>
        {hasEventAnalytics ? (
          <>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Event Analytics
                </Typography>
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                      title: {
                        display: true,
                        text: "Revenue and Participants per Event",
                      },
                    },
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Ticket Availability
                </Typography>
                <Pie
                  data={pieChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                      title: {
                        display: true,
                        text: "Ticket Availability vs Sales",
                      },
                    },
                  }}
                />
              </Box>
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <Typography variant="h6" align="center">
              No Event Analytics Available
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TenantStats;
