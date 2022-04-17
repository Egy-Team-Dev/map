import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import * as L from "leaflet";
import * as M from "./leafletchild";
import { iconPerson } from "./icon";

const MapView = ({ vehicles }) => {
  const map = useRef();
  const clusterLayer = useRef();

  useEffect(() => {
    clusterLayer.current?.remove();
    if (!map.current) {
      return;
    }

    if (clusterLayer && clusterLayer.current) {
      map.current.removeLayer(clusterLayer.current);
      clusterLayer.current?.remove();
    }
    /////////////////////////////////////////////////////////////////////////////////////////////
    var Mapjs = {
      const: {
        options: {
          minZoom: 6,
          maxZoom: 18,
          attribution:
            '&copy; <a href="https://www.saferoad.com.sa">Saferoad</a>',
          animate: { animate: true, duration: 1.5, easeLinearity: 0.75 },
        },
      },
    };

    var clustericon = function (cluster) {
      var baseurl = window.location;
      baseurl = baseurl.protocol + "//" + baseurl.host + "/";

      var count = cluster.getChildCount();
      var img = count < 10 ? 1 : parseInt(Math.log10(count));
      var htmldiv =
        "<div class='icon-Container'>" +
        "<img class='icon' src='" +
        baseurl +
        "Images/map/m" +
        img +
        ".png'>" +
        "<span class='label L" +
        img +
        "'>" +
        count +
        "</span><div class='tip' style='display:none'></div>" +
        "</div>";
      return L.divIcon({
        html: htmldiv,
        className: "clus-i",
        iconSize: L.point(52, 52),
      });
    };

    clusterLayer.current = L.markerClusterGroup({
      disableClusteringAtZoom: Mapjs.const.options.maxZoom,
      iconCreateFunction: function (cluster) {
        return clustericon(cluster);
      },
    });

    /////////////////////////////////////////////////////////////////////////////////////////////
    vehicles.forEach((vehicle) =>
      L.marker(L.latLng(vehicle.lat, vehicle.long), { icon: iconPerson })
        .bindTooltip(`Vehicle Angle is ${vehicle.rotate}&ordm;`)
        .addTo(clusterLayer.current)
    );
    map.current.addLayer(clusterLayer.current);
  }, [vehicles]);

  useEffect(() => {
    const mapNode = ReactDOM.findDOMNode(document.getElementById("mapId"));

    if (!mapNode || map.current) {
      return;
    }
    map.current = L.map(mapNode).setZoom(11).setView(L.latLng(30.78, 31.0));
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 17,
    }).addTo(map.current);
  }, []);
  return <div style={{ width: "100%", height: "100vh" }} id="mapId" />;
};

export default MapView;
