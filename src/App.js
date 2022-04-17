import React, { useEffect, useState, useMemo } from "react";
import socketIOClient from "socket.io-client";
import logo from "./logo.svg";
import "./App.css";
import MapView from "./MapView";

const ENDPOINT = "http://localhost:8080";

import("leaflet.markercluster/dist/leaflet.markercluster.js");
import("leaflet.markercluster/dist/MarkerCluster.css");
import("leaflet.markercluster/dist/MarkerCluster.Default.css");

function App() {
  const [vehicles, setVehicles] = useState([]);
  const vehicleArray = useMemo(
    () => Object.keys(vehicles).map((id) => vehicles[id]),
    [vehicles]
  );

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("initialData", (data) => setVehicles(data));
  }, []);

  return (
    <div className="App container">
      <MapView vehicles={vehicleArray} />
    </div>
  );
}

export default App;
