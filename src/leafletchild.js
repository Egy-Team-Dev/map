import * as L from "leaflet";
import * as Resources from "../src/Resources";
//L.Saferoad Library Defintion
L.Saferoad = {};
L.Saferoad.version = "1.2.5";
L.Saferoad.options = {};
L.Saferoad.locs = {};
L.Saferoad.map = {};

//Map Class Defintion
L.Saferoad.Map = L.Map.extend({
  initGroups: function () {
    this.groups.cluster = L.markerClusterGroup({
      disableClusteringAtZoom: L.Saferoad.options.maxZoom,
      iconCreateFunction: function (cluster) {
        return clustericon(cluster);
      },
    });
    this.groups.noncluster = L.featureGroup();

    this.groups.markerGroup = L.featureGroup().addTo(this);
    this.groups.geofenceGroup = L.featureGroup().addTo(this);
    this.groups.poiGroup = L.featureGroup().addTo(this);
    this.groups.drawGroup = L.featureGroup().addTo(this);

    this.setCluster(true);

    var clustericon = function (cluster) {
      var baseurl = window.location;
      baseurl = baseurl.protocol + "//" + baseurl.host + "/";

      var count = cluster.getChildCount();
      var img = count < 10 ? 1 : parseInt(Math.log10(count));
      var htmldiv =
        "<img class='icon' src='" +
        baseurl +
        "Images/map/m" +
        img +
        ".png'>" +
        "<span class='label L" +
        img +
        "'>" +
        count +
        "</span><div class='tip' style='display:none'></div>";
      return L.divIcon({
        html: htmldiv,
        className: "clus-i",
        iconSize: L.point(52, 52),
      });
    };
  },
  groups: {
    cluster: null,
    noncluster: null,
    markerGroup: null,
    geofenceGroup: null,
    poiGroup: null,
    drawGroup: null,
  },
  lists: {
    uservehs: {},
    drawList: [],
    measurePoints: [],
    coordinatePoint: [],
  },
  counters: {
    addrSync: null,
    timerCount: null,
  },
  setCluster: function (_enableCluster) {
    if (_enableCluster) {
      this.groups.noncluster.eachLayer((m) => this.groups.cluster.addLayer(m));
      this.removeLayer(this.groups.noncluster);
      this.addLayer(this.groups.cluster);
      this.groups.noncluster.clearLayers();
    } else {
      var vehicles = this.groups.cluster.getLayers();
      vehicles.forEach((m) => this.groups.noncluster.addLayer(m));
      this.removeLayer(this.groups.cluster);
      this.addLayer(this.groups.noncluster);
      this.groups.cluster.clearLayers();
    }
  },
  activeGroup: function () {
    return this.hasLayer(this.groups.cluster)
      ? this.groups.cluster
      : this.groups.noncluster;
  },
  visibleGroup: function () {
    var visible = L.featureGroup();
    this.activeGroup().eachLayer((m) => {
      if (this.getBounds().contains(m.getLatLng())) visible.addLayer(m);
    });
    return visible;
  },
  addVehicle: function (vehicle, doRezoom = true) {
    this.activeGroup().addLayer(vehicle);
    if (doRezoom) this.rezoom("visible", vehicle);
  },
  removeVehicle: function (vehicle, doRezoom = true) {
    this.activeGroup().removeLayer(vehicle);
    if (doRezoom) this.rezoom();
  },
  rezoom: function (_show = "visible", _newMark) {
    var group = this.activeGroup();
    if (_newMark instanceof L.Marker) group.addLayer(_newMark);

    var markers = group.getLayers();
    if (markers.length === 1) {
      this.flyTo(
        markers[0].getLatLng(),
        L.Saferoad.options.maxZoom,
        L.Saferoad.options.animate
      );
    } else if (markers.length > 1) {
      group.eachLayer(function (marker) {
        marker.closePopup();
      }); //.vehicles.forEach(vehicle => { vehicle.marker.closePopup(); });
      var bound = group.getBounds();
      var minzoom = this.getBoundsZoom(bound);
      this.flyTo(
        bound.getCenter(),
        minzoom < L.Saferoad.options.maxZoom
          ? minzoom
          : L.Saferoad.options.maxZoom,
        L.Saferoad.options.animate
      );
    } else {
      this.setView(
        L.Saferoad.locs.ksa,
        L.Saferoad.options.minZoom,
        L.Saferoad.options.animate
      );
    }
  },
  deselectAll: function (doRezoom = true) {
    this.activeGroup().clearLayers();
    if (doRezoom) this.rezoom();
  },
  pin: function (_locInfo, doRezoom = true) {
    var latlng = L.latLng(_locInfo.Latitude, _locInfo.Longitude);
    var newMark = L.Saferoad.vehicle(latlng, { locInfo: _locInfo });
    var oldMark = this.getVehicle(_locInfo.VehicleID);

    if (typeof oldMark === "undefined") this.addVehicle(newMark, doRezoom);
    else if (
      new Date(newMark.options.locInfo.RecordDateTime) >
      new Date(oldMark.options.locInfo.RecordDateTime)
    )
      oldMark.animate(_locInfo);

    return _locInfo.VehicleID;
  },
  unpin: function (_VehicleID, doRezoom = true) {
    var oldMark = this.getVehicle(_VehicleID);
    if (typeof oldMark === "undefined") return;
    this.removeVehicle(oldMark, doRezoom);
  },
  getVehicle: function (_VehicleID) {
    return this.activeGroup()
      .getLayers()
      .find((x) => x.options.locInfo.VehicleID == _VehicleID);
  },
  isExist: function (_VehicleID) {
    return this.groups.cluster
      .getLayers()
      .map((x) => x.options.locInfo.VehicleID)
      .includes(_VehicleID);
  },
  addEvents: function () {
    this.on("click", L.Saferoad.Map.Events.click);
    this.on("mousemove", L.Saferoad.Map.Events.mousemove);
    // this.on("popupopen", function (e) {
    //   var locInfo = e.popup._source.options.locInfo;
    //   var dur = Math.abs(new Date(locInfo.RecordDateTime) - Date.now());
    //   var _divID = ".pop_V_" + locInfo.VehicleID + " #Address";
    //   if (
    //     $(_divID).length &&
    //     (!Mapjs.helpers.isValidAddress(locInfo.Address) || dur > 5 * 6e4)
    //   ) {
    //     Mapjs.helpers.getAddress(locInfo.SerialNumber, $(_divID));
    //   }
    // });
    // this.on("zoomend", L.Saferoad.Map.Events.zoomend),
    //   this.on(L.Draw.Event.CREATED, L.Saferoad.Map.Events.drawCreated); //event for draw geofence and poi

    this.groups.cluster.on("clustermouseover", (a) => {
      var exportUrl = (c) =>
        "/Map/exportClusterVehicles?vehicleIDs=" +
        c.map((m) => m.options.locInfo.VehicleID).join(",");
      var markers = a.layer.getAllChildMarkers();
      var rows = [];

      markers.every((mark, i) => {
        var loc = mark.options.locInfo;
        var row =
          "<tr><td width='155'>" +
          loc.DisplayName +
          "</td><td><div class='Speed'>" +
          loc.Speed +
          "<span>Kmh</span></div></td><td>" +
          L.Saferoad.Vehicle.Helpers.VStatusToIcon(loc.VehicleStatus) +
          "</td></tr>";
        rows.push(row);
        return !(i > 30);
      });
      var topbar = [
        "<a class='act' onClick='event.stopPropagation()' href='" +
          exportUrl(markers) +
          "'><i class='fas fa-file-download'></i></a>",
        "<a href='#'><i class='fas fa-search-plus'></i></a>",
      ];
      topbar = "<div class='bar'>" + topbar.join("") + "</div>";

      // $(a.layer._icon)
      //   .find(".tip")
      //   .html(topbar + "<table>" + rows.join("") + "</table>");
      // $(a.layer._icon).find(".tip").css("display", "block");
      // $(a.layer._icon)
      //   .find(".tip")
      //   .bind("mousewheel", ".tip", function (e) {
      //     e.stopPropagation();
      //   });
    });
    // this.groups.cluster.on("clustermouseout", (a) => {
    //   $(a.layer._icon).find(".tip").css("display", "none");
    //   $(a.layer._icon).find(".tip").unbind("mousewheel");
    // });
  },
});
L.Saferoad.Map.addInitHook(function () {
  var tiles = this.options.tiles;
  var overlayMaps = {};

  var baseMaps = {
    Saferoad: tiles.Saferoad,
    "Google Hybrid": tiles.googleHybridJS,
    "Google Streets": tiles.googleStreetsJS,
    "Google Dark": tiles.googleStreetsDarkJS,
  };

  this.options.animation = this.options.animation ?? "simple";
  L.control.fullscreen().addTo(this);
  L.control.layers(baseMaps, overlayMaps).addTo(this);
  this.initGroups();
  this.addEvents();
});
L.Saferoad.map = (element, options) => new L.Saferoad.Map(element, options);
L.Saferoad.Map.Events = {
  click: function (e) {
    // var measureActive = $("#Measure").hasClass("imgclicked");
    // var coordinatesActive = $("#Coordinates").hasClass("imgclicked");
    // if (measureActive) {
    //   if (Mapjs.map.lists.measurePoints.length > 0) {
    //     var points = [Mapjs.map.lists.measurePoints[0], e.latlng];
    //     var distance = (points[0].distanceTo(points[1]) / 1000).toFixed(3);
    //     Mapjs.helpers.geocoding("#fromAddr", points[0]);
    //     Mapjs.helpers.geocoding("#toAddr", points[1]);
    //     $("#CoordinatesResultText").html(
    //       "Distance is " +
    //         distance +
    //         " KM" +
    //         '<BR>From: <span id="fromAddr">' +
    //         points[0] +
    //         "</span>" +
    //         '<BR>To: <span id="toAddr">' +
    //         points[1] +
    //         "</span>"
    //     );
    //     $("#CopyCoordinates").show();
    //     Mapjs.map.lists.measurePoints.pop();
    //   } else {
    //     Mapjs.map.groups.markerGroup.clearLayers();
    //     Mapjs.map.lists.measurePoints.push(e.latlng);
    //   }
    //   L.marker(e.latlng).addTo(Mapjs.map.groups.markerGroup);
    // }
    // if (coordinatesActive) {
    //   if (Mapjs.map.lists.coordinatePoint.length > 0) {
    //     Mapjs.map.lists.coordinatePoint.pop();
    //   } else {
    //     Mapjs.map.lists.coordinatePoint.push(e.latlng);
    //     Mapjs.helpers.geocoding("#PointAddr", e.latlng);
    //     $("#CoordinatesResultText").html(
    //       "Point: " + e.latlng + '<BR>Address: <span id="PointAddr">'
    //     );
    //   }
    // }
  },
  mousemove: function (e) {
    // var coordinatesActive = $("#Coordinates").hasClass("imgclicked");
    // if (coordinatesActive) {
    //   if (Mapjs.map.lists.coordinatePoint.length == 0) {
    //     $("#CoordinatesResultText").html("Point: " + e.latlng);
    //   }
    // }
  },
  drawCreated: function (e) {
    // $("#CircleCenter").val("");
    // $("#CircleRadius").val("");
    // $("#Path").val("");
    // $("#Bounds").val("");

    var layer = e.layer;
    // switch (e.layerType) {
    //   case "circle":
    //     $("#CircleCenter").val(
    //       "(" + layer.getLatLng().lat + ", " + layer.getLatLng().lng + ")"
    //     );
    //     $("#CircleRadius").val(layer.getRadius());
    //     break;
    //   case "polygon":
    //     var paths = "";
    //     layer.getLatLngs()[0].forEach((x) => {
    //       paths += "|" + x.lat + "," + x.lng;
    //     });
    //     $("#Path").val(paths);
    //     break;
    //   case "rectangle":
    //     var bounds = [
    //       layer.getBounds()._northEast,
    //       layer.getBounds()._southWest,
    //     ];
    //     bounds =
    //       "(" +
    //       bounds[0].lat +
    //       "," +
    //       bounds[0].lng +
    //       ")|(" +
    //       bounds[1].lat +
    //       "," +
    //       bounds[1].lng +
    //       ")"; // bounds[0] ~ _northEast, bounds[1] ~ _southWest
    //     $("#Bounds").val(bounds);
    //     break;
    //   case "marker":
    //     $("#POILatitude").val(layer.getLatLng().lat);
    //     $("#POILongitude").val(layer.getLatLng().lng);
    //     break;
    // }
    L.Saferoad.map.groups.drawGroup.addLayer(layer);
  },
  zoomend: function (e) {
    var markers = this.activeGroup().getLayers();
    if (markers.length == 1) {
      if (this.activeGroup() == this.groups.cluster)
        this.groups.cluster.zoomToShowLayer(markers[0], () =>
          markers[0].openPopup()
        );
      else markers[0].openPopup();
    }
  },
};
//Icon Class Defintion
L.Saferoad.Icon = L.Icon.extend({
  options: {
    VehicleStatus: null,
  },
  initialize: function (options) {
    options = L.Util.setOptions(this, options);
    options.iconSize = [30, 30];
    options.iconAnchor = [15, 15];
    options.iconUrl = L.Saferoad.Icon.Helpers.iconUrl(options.VehicleStatus);
    L.setOptions(this, options);
  },
  refresh: function () {
    this.options.iconUrl = L.Saferoad.Icon.Helpers.iconUrl(
      this.options.VehicleStatus
    );
  },
});
L.Saferoad.icon = (options) => new L.Saferoad.Icon(options);
L.Saferoad.Icon.Helpers = {
  iconUrl: function (VehicleStatus) {
    var iconurl = window.location;
    iconurl = iconurl.protocol + "//" + iconurl.host + "/Images/map/";
    switch (VehicleStatus) {
      case 0:
      case 1:
      case 2:
      case 5:
      case 100:
      case 101:
        iconurl += VehicleStatus + ".png";
        break;
      case 600:
        iconurl += "5.png";
        break;
      default:
        iconurl += "201.png";
    }
    return iconurl;
  },
};

//Popup Class Defintion
L.Saferoad.Popup = L.Popup.extend({
  options: {
    //Set Default Value before read entered options
    locInfo: {},
  },
  initialize: function (options) {
    options = L.Util.setOptions(this, options);
    L.setOptions(this, options);
  },
  addEvents: function () {
    this.on("add", L.Saferoad.Popup.Events.add);
    this.on("remove", L.Saferoad.Popup.Events.remove);
  },
  syncContent: function () {
    var row = (content, style = "") => {
      return `<div class="row rowPoi popcol" style="${style}">${content}</div>`;
    };

    var prop = (
      id,
      val = "",
      unit = "",
      style = "",
      align = "l",
      fsize = 1.5
    ) => {
      var tips = Resources.Tips[id];
      var icon = Resources.Icons[id];
      var icsize = align == "t" ? "3" : fsize * 1.2;
      var value = (align == "t" ? "<BR>" : " ") + val;

      style += val == null ? (style != "" ? ";" : "") + "display: none" : "";

      return (
        `<div id="col-${id}" class="col" style="text-align: center;${style}"><span title="${tips}" style="font-size:${fsize}vh !important"><i class="${icon}" style="color: #3E84B8;font-size: ${icsize}vh !important;"></i>` +
        ` <span id="${id}">${value}</span></span><span class="unit">${unit}</span></div>`
      );
    };

    var locInfo = this.options.locInfo;
    var addr = () =>
      locInfo.Address ?? "(" + locInfo.Latitude + "," + locInfo.Longitude + ")";
    var driver = () =>
      locInfo.DriverID > 0 && locInfo.DriverID != null
        ? `<a href="/Drivers/Index?DriverID=${locInfo.DriverID}"  target="_blank" > ${locInfo.DriverName}</a>`
        : Resources.Tips.DriverNA;
    var senscss = !locInfo.HasSensor ? "display: none" : "";
    // content = '<div class="container">';
    // content += row(
    //   prop("RecordDateTime", locInfo.RecordDateTime) +
    //     prop("Speed", locInfo.Speed, "km/h") +
    //     prop("Direction", locInfo.Direction + " &deg;")
    // );
    // content += row(
    //   prop(
    //     "EngineStatus",
    //     L.Saferoad.Popup.Helpers.EStatusToStr(locInfo.EngineStatus)
    //   ) +
    //     prop(
    //       "VehicleStatus",
    //       L.Saferoad.Popup.Helpers.VStatusToStr(locInfo.VehicleStatus)
    //     )
    // );
    // content += row(
    //   prop("Mileage", locInfo.Mileage, "KM") +
    //     prop(
    //       "Duration",
    //       L.Saferoad.Popup.Helpers.DurationToStr(locInfo.Duration),
    //       "",
    //       ""
    //     )
    // );
    // content += row(
    //   prop("DriverUrl", driver()) +
    //     prop("GroupName", locInfo.GroupName) +
    //     prop("PlateNumber", locInfo.PlateNumber)
    // );
    // content += row(
    //   prop("SimCardNumber", locInfo.SimCardNumber) +
    //     prop("SerialNumber", locInfo.SerialNumber)
    // );
    // content += row(
    //   prop(
    //     "IgnitionStatus",
    //     L.Saferoad.Popup.Helpers.IgnitionToStr(locInfo.IgnitionStatus)
    //   ) +
    //     prop("weightreading", locInfo.WeightReading, "kg", senscss) +
    //     prop("Temp", locInfo.Temp, "C", senscss) +
    //     prop("HUM", locInfo.HUM, "", senscss)
    // );
    // content += row(prop("Address", addr())) + "</div>";

    // container = `<div id="MovePopup" data-VehicleID="${locInfo.VehicleID}" class="iwcontent pop-up-map-specific pop_V_${locInfo.VehicleID}">`;
    // container += `<span class="iwtitle">${locInfo.DisplayName}</span>`;
    // container += `<div id="iwcontent"><span class="field2" style="padding:0;border:0;">${content}</span>${this.getButtons()}</div></div>`;

    // this.setContent(container);

    var pubLocInfo = Mapjs.map.lists.uservehs.find(
      (x) => x.SerialNumber == locInfo.SerialNumber
    );
    if (typeof pubLocInfo.timerCount != "undefined")
      clearInterval(pubLocInfo.timerCount);
    pubLocInfo.timerCount = setInterval(() => {
      var now = new Date(
        L.Saferoad.Vehicle.Helpers.Date2KSA(new Date().getTime())
      );
      var dur = Math.abs(now - new Date(locInfo.RecordDateTime));
      var durStr = L.Saferoad.Popup.Helpers.DurationToStr(
        locInfo.Duration + dur
      );
      ("#MovePopup.pop_V_" + locInfo.VehicleID).find("#Duration").text(durStr);
    }, 1000);
  },
  // getButtons: function () {
  //   var locInfo = this.options.locInfo;

  //   return getmainbuttons(this.options.locInfo);
  // },
  UpdateContent: function (_locInfo) {
    var div = "#MovePopup.pop_V_" + _locInfo.VehicleID;
    if (typeof div == "undefined") return;

    var updatedKeys = Object.entries(_locInfo)
      .filter((x) => this.options.locInfo[x[0]] != x[1])
      .map((x) => (x = x[0]));
    this.options.locInfo = _locInfo;
    this.syncContent();
    div = "#MovePopup.pop_V_" + _locInfo.VehicleID;
    updatedKeys.forEach((x) => div.find("#" + x).effect("highlight", {}, 5e3));
  },
});
L.Saferoad.Popup.addInitHook(function () {
  this.addEvents();
  this.syncContent();
});
L.Saferoad.popup = (options) => new L.Saferoad.Popup(options);
L.Saferoad.Popup.Helpers = {
  IgnitionToStr: (VehicleStatus) =>
    VehicleStatus == 1
      ? Resources.Status.IgnitionEnabled
      : Resources.Status.IgnitionDisabled,
  EStatusToStr: (EngineStatus) =>
    EngineStatus ? Resources.Status.EngineOn : Resources.Status.EngineOff,
  VStatusToStr: (VehicleStatus) => {
    switch (VehicleStatus) {
      case 600:
      case 5:
        return Resources.Status.VehicleOffline;
        break;
      case 101:
        return Resources.Status.VehicleOverSpeed;
        break;
      case 100:
        return Resources.Status.VehicleOverStreetSpeed;
        break;
      case 0:
        return Resources.Status.VehicleStopped;
        break;
      case 1:
        return Resources.Status.VehicleRunning;
        break;
      case 2:
        return Resources.Status.VehicleIdle;
        break;
      default:
        return Resources.Status.VehicleInvalid;
    }
  },
  DurationToStr: (ms) => {
    var pad = (n, z = 2) => (n < 99 ? ("00" + n).slice(-z) : "+99");
    return `${pad((ms / 8.64e7) | 0)}d:${pad(
      ((ms % 8.64e7) / 3.6e6) | 0
    )}:${pad(((ms % 3.6e6) / 6e4) | 0)}:${pad(((ms % 6e4) / 1e3) | 0)}`;
    //return `${pad(ms / 2.628e9 | 0)}:${pad((ms % 2.628e9) / 8.64e7 | 0)}:${pad((ms % 8.64e7) / 3.6e6 | 0)}:${pad((ms % 3.6e6) / 6e4 | 0)}:${pad((ms % 6e4) / 1e3 | 0)}`;
  },
};
L.Saferoad.Popup.Events = {
  add: function (e) {
    //e.target.syncContent();
    //console.log(`${e.target.options.locInfo.VehicleID}: Popup show`);
  },
  remove: function (e) {
    //console.log(`${e.target.options.locInfo.VehicleID}: Popup hide`);
  },
};

//Vehicle Class Defintion
L.Saferoad.Vehicle = L.Marker.extend({
  options: {
    //Set Default Value before read entered options
    locInfo: {},
    locSync: null,
  },
  initialize: function (latlng, options) {
    //Set variable values after getting options
    this.id = options.locInfo.VehicleID;
    this._latlng = latlng;
    options = L.Util.setOptions(this, options);
    options.icon = L.Saferoad.icon({
      VehicleStatus: options.locInfo.VehicleStatus,
    });
    options.rotationAngle = options.locInfo.Direction ?? 0;
    L.setOptions(this, options);

    this.bindPopup(L.Saferoad.popup({ locInfo: options.locInfo }));
    this.bindTooltip(options.locInfo.DisplayName);
  },
  animate: function (_locInfo) {
    if (Mapjs.map.options.animation == "advanced") {
      if (this.slideFinish())
        this.setRotationAngle(this.options.locInfo.Direction);
      this.advancedAnimate(_locInfo);
    } else {
      this.setLatLng([_locInfo.Latitude, _locInfo.Longitude]);
    }

    this.setIcon(L.Saferoad.icon({ VehicleStatus: _locInfo.VehicleStatus }));
    this.setRotationAngle(_locInfo.Direction);
    this.getPopup().UpdateContent(_locInfo); //_oldVeh._popup.setContent(_newVeh.getPopup().getContent());
    this.options.locInfo = _locInfo;
  },
  advancedAnimate: function (_locInfo) {
    var leastAngleChange = (ang1, ang2) =>
      Math.abs(((ang2 - ang1 + 180) % 360) - 180);
    var oneStep = (_anglDiff, _duration) => {
      var angleSign =
        this.options.locInfo.Direction + _anglDiff - _locInfo.Direction
          ? 1
          : -1;
      this.setRotationAngle(
        this.options.locInfo.Direction + 0.5 * _anglDiff * angleSign
      );
      this.slideTo([_locInfo.Latitude, _locInfo.Longitude], {
        duration: _duration,
      });
    };
    var multiSteps = (_from, _duration) => {
      var url = `http://40.114.70.142:5000/route/v1/driving/${_from.lng},${_from.lat};${_locInfo.Longitude},${_locInfo.Latitude}?steps=true`; //"40.114.70.142:5000" //"router.project-osrm.org"
      var jqxhr = $.ajax({ url: url, cache: true });
      jqxhr.done((data) => {
        var ETA = data.routes[0].duration;
        data.routes[0].legs[0].steps.forEach((step) => {
          if (step.maneuver.type == "arrive") return;

          var stepDur = _duration * (step.duration / ETA);
          var stepDir = step.maneuver.bearing_after;
          var stepTo = step.maneuver.location;
          this.slideTo([stepTo[1], stepTo[0]], { duration: stepDur });
          this.setRotationAngle(stepDir);
        });
        this.slideTo([_locInfo.Latitude, _locInfo.Longitude], {
          duration: 100,
        });
      });
      jqxhr.fail(() => {
        this.setLatLng([_locInfo.Latitude, _locInfo.Longitude]);
      });
    };

    var fromCoor = this.getLatLng();
    var distDiff = fromCoor.distanceTo([_locInfo.Latitude, _locInfo.Longitude]);
    var timeDiff = Math.abs(
      new Date(this.options.locInfo.RecordDateTime) -
        new Date(_locInfo.RecordDateTime)
    );
    var anglDiff = leastAngleChange(
      this.options.locInfo.Direction,
      _locInfo.Direction
    );
    var timedelay = Math.abs(Date.now() - new Date(_locInfo.RecordDateTime));
    var applyTime = Math.min(
      Math.max(60e3 - timedelay, 10e3),
      (distDiff * 3600) / 80
    );

    if (
      Mapjs.map.getZoom() >= 13 &&
      Mapjs.map.getBounds().contains(this.getLatLng())
    ) {
      timeDiff < 120e3 && distDiff < 500 && anglDiff < 25
        ? oneStep(anglDiff, applyTime)
        : multiSteps(fromCoor, applyTime);
    } else {
      this.setLatLng([_locInfo.Latitude, _locInfo.Longitude]);
    }
  },
  setTreeNode: function (enable) {
    $("#GroupsList").jstree(
      enable ? "enable_node" : "disable_node",
      "V_" + this.options.locInfo.VehicleID
    );
  },
  sync: function () {
    this.options.rotationAngle = this.options.locInfo.Direction ?? 0;
    this.options.title = "";
    //this.setIcon();
  },
});
L.Saferoad.vehicle = (latlng, options) =>
  new L.Saferoad.Vehicle(latlng, options);
L.Saferoad.Vehicle.Helpers = {
  VStatusToIcon: (VehicleStatus) => {
    switch (VehicleStatus) {
      case 0:
        return '<i class="fas fa-parking" style="color:#4D413D;"></i>';
        break;
      case 1:
        return '<i class="fas fa-play-circle" style="color:#93AC35;"></i>';
        break;
      case 2:
        return '<i class="fas fa-pause-circle" style="color:#0B8949;"></i>';
        break;
      case 5:
      case 600:
        return '<i class="fas fa-stop-circle" style="color:#B8B2AC;"></i>';
        break;
      case 101:
        return '<i class="fas fa-exclamation-circle" style="color:#C03728;"></i>';
        break;
      case 100:
        return '<i class="fas fa-exclamation-circle" style="color:#CF7D29;"></i>';
        break;
      default:
        return '<i class="fas fa-minus-circle" style="color:#0D6DA6;"></i>';
    }
  },
  VStatusToColor: (VehicleStatus) => {
    switch (VehicleStatus) {
      case 0:
        return "#4D413D";
        break;
      case 1:
        return "#93AC35";
        break;
      case 2:
        return "#0B8949";
        break;
      case 5:
      case 600:
        return "#B8B2AC";
        break;
      case 101:
        return "#C03728";
        break;
      case 100:
        return "#CF7D29";
        break;
      default:
        return "#0D6DA6";
    }
  },
  StatusTypes: {
    isOnline: (VehicleStatus) => ![5, 600].includes(VehicleStatus),
    isOffline: (VehicleStatus) => [5, 600].includes(VehicleStatus),
  },
  WeightVoltToKG: (_locInfo, _settings) => {
    if (_locInfo.WeightVolt < 0) return _settings.WeightReading;
    if (
      _locInfo.WeightVolt < _settings.MinVoltage ||
      _settings.MinVoltage == _settings.MaxVoltage
    )
      return Resources.Tips.NA;

    var weight =
      _settings.MaxVoltage == _settings.MinVoltage
        ? 0
        : ((_locInfo.WeightVolt - _settings.MinVoltage) *
            _settings.TotalWeight) /
          (_settings.MaxVoltage - _settings.MinVoltage);
    weight += _settings.HeadWeight;
    return weight.toFixed(1);
  },
  Date2UTC: (_date) =>
    new Date(
      _date.indexOf("Date") < 0
        ? _date + "+0000"
        : moment.utc(_date).format("YYYY-MM-DDTHH:mm:ss") + "-0300"
    ),
  Date2KSA: (_date, _zone = 3) =>
    moment
      .utc(_date)
      .utcOffset(_zone * 60)
      .format("LL hh:mm:ss a"),
};
