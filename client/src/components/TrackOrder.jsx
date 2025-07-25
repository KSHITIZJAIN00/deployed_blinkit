import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import io from "socket.io-client";
import riderIcon from "../assets/rider.png";
import arrivedImg from "../assets/order.webp";
import tickIcon from "../assets/tick.png";
import "./TrackOrder.css";

const socket = io("https://deployed-blinkit-backend.onrender.com");

const TrackOrder = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const customerLocationRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const orderId = "123";

  const statuses = [
    { inProgress: "Packing your order...", completed: "✅ Order Packed" },
    { inProgress: "Picked by delivery partner...", completed: "✅ Picked Up" },
    { inProgress: "Order dispatched...", completed: "✅ Dispatched" },
    { inProgress: "Out for delivery...", completed: "✅ Delivered" },
  ];

  const customIcon = L.icon({
    iconUrl: riderIcon,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  });

  useEffect(() => {
    let initialized = false;
    const timers = [];

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (initialized || mapRef.current) return;
        initialized = true;

        const customer = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        customerLocationRef.current = customer;

        const warehouse = { lat: 27.4924, lng: 77.6737 };

        const map = L.map(mapContainerRef.current).setView([warehouse.lat, warehouse.lng], 13);
        mapRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        L.polyline([[warehouse.lat, warehouse.lng], [customer.lat, customer.lng]], {
          color: "blue",
        }).addTo(map);

        // Status change every 30s, final status only changes after rider arrives
        timers.push(setTimeout(() => setStatusIndex(1), 30 * 1000)); // Picked
        timers.push(setTimeout(() => setStatusIndex(2), 60 * 1000)); // Dispatched
        timers.push(setTimeout(() => {
          setStatusIndex(3); // Out for delivery
          socket.emit("start-tracking", {
            orderId,
            customerLocation: customer,
          });
        }, 90 * 1000)); // Start tracking after 90s
      },
      (err) => {
        console.error("Geolocation error:", err);
      }
    );

    socket.on("receive-location", ({ latitude, longitude }) => {
      const map = mapRef.current;
      if (!map) return;

      const riderLatLng = L.latLng(latitude, longitude);

      if (!markerRef.current) {
        markerRef.current = L.marker(riderLatLng, { icon: customIcon }).addTo(map);
      } else {
        markerRef.current.setLatLng(riderLatLng);
      }

      map.flyTo(riderLatLng, map.getZoom(), {
        animate: true,
        duration: 0.5,
      });

      const customer = customerLocationRef.current;
      if (customer) {
        const distance = riderLatLng.distanceTo(L.latLng(customer.lat, customer.lng));
        if (distance < 40 && !showPopup) {
          setShowPopup(true);
          setStatusIndex(4); // Final delivered status
        }
      }
    });

    return () => {
      timers.forEach(clearTimeout);
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
      socket.off("receive-location");
    };
  }, []);

  return (
    <>
      <header className="track-header">📦 Tracking Order #{orderId}</header>

      <div className="status-tracker-horizontal">
        {statuses.map((status, i) => (
          <div
            key={i}
            className={`status-item ${i < statusIndex ? "completed" : i === statusIndex ? "current" : ""}`}
          >
            <div className="status-icon">
              {i < statusIndex ? (
                <img src={tickIcon} alt="Done" className="tick-icon" />
              ) : i === statusIndex ? (
                <span className="spinner" />
              ) : (
                <span className="waiting">⏳</span>
              )}
            </div>
            <div className="status-text">
              {i < statusIndex ? status.completed : status.inProgress}
            </div>
          </div>
        ))}
      </div>

      <div ref={mapContainerRef} id="map" style={{ height: "80vh", width: "100%" }} />

      {showPopup && (
        <div className="arrival-popup">
          <h2>🎉 Order Arrived!</h2>
          <img src={arrivedImg} alt="Order Arrived" />
        </div>
      )}
    </>
  );
};

export default TrackOrder;
