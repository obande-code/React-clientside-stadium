export function loadScript(src, position, id) {
    if (!position) {
      return;
    }
  
    const script = document.createElement("script");
    script.setAttribute("async", "");
    script.setAttribute("id", id);
    script.src = src;
    position.appendChild(script);
  }
  

export const initMap = (placeId) => {
    const google = window.google;
    const element = document.createElement("div");
    const map = new google.maps.Map(element, {
      //   center: { lat: -33.866, lng: 151.196 },
      //   zoom: 15,
    });
  
    const request = {
      placeId: placeId,
      fields: ["name", "formatted_address", "place_id", "geometry"],
    };
    // const infowindow = new google.maps.InfoWindow();
    const service = new google.maps.places.PlacesService(map);
    return { service, request };
  };