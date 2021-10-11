import React, { usestate } from "react";
import GoogleMapReact from "google-map-react";
import { getDistance } from 'geolib';

import MapPin from "./MapPin";
import RoomIcon from "@material-ui/icons/Room";
import { red } from "@material-ui/core/colors";

import { mapStyles } from "./styles";

const API_KEY = process.env.REACT_APP_API_KEY;

function Map({ chosenLocation, listings, timeDelta, onClickMapPin, handleMapResearch }) {
  const zoomLevel = 14;

  const styles = mapStyles();

  let newCenterForMap;
  let research = false;

  const handleClickedMapPin = (spot) => {
    onClickMapPin(spot);
  };

  function renderPin(spot, price) {
    return (
      <MapPin
        key={spot.spotId}
        lat={spot.l[0]}
        lng={spot.l[1]}
        text={spot.spot_name}
        onClickedMapPin={() => handleClickedMapPin(spot)}
        spotInfo={spot}
        price={price}
      />
    );
  }

  function renderListingPins(listings) {
    let renderedPins = [];
    for (const spot of listings) {
      let price = spot.bookingPrice;
      renderedPins.push(renderPin(spot, price));
    }
    return renderedPins;
  }


  const handleApiLoaded = (map, maps) => {
    maps.event.addListener(map, "dragend", function() {
      let center = this.getCenter();
      var latitude = center.lat();
      var longitude = center.lng();

      let distance = getDistance(
          { latitude: chosenLocation.lat, longitude: chosenLocation.lng },
          { latitude: latitude, longitude: longitude }
      );

      if ( distance >= 4000) {
        let newCenter = {
          lat: latitude,
          lng: longitude
        }

        newCenterForMap = newCenter;
        research = true
        //handleMapResearch(newCenter);
      }
      console.log(`Distance is: ${distance}`)
      console.log("current latitude is: " + latitude);
      console.log("current longitude is: " + longitude);
    });
  };


  return (
    <div id="mainMap" className={styles.mainMap}>
      <GoogleMapReact options={{
        gestureHandling:"greedy",
        maxZoom:zoomLevel + 5,
        minZoom:zoomLevel - 3
      }}  
        resetBoundsOnResize={true}
        bootstrapURLKeys={{ key: API_KEY }}
        center={chosenLocation}
        defaultZoom={zoomLevel}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
      >
          <RoomIcon
          style={{
          color: red[500],
          fontSize: 50,
          position: "inherit",
          top: "-45px",
          right: "-25px",
        }}
          lat={chosenLocation.lat}
          lng={chosenLocation.lng}
          />

        {listings.length && renderListingPins(listings)}
      </GoogleMapReact>
    </div>
  );
}

export default Map;
