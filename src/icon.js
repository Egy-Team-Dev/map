import L from "leaflet";

const iconPerson = new L.Icon({
  iconUrl: require("./img/marker.png"),
  iconRetinaUrl: require("./img/marker.png"),
  iconAnchor: null,
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null,
  iconSize: new L.Point(15, 35),
  className: "leaflet-div-icon",
});

export { iconPerson };
