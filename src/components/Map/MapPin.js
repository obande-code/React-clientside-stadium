import React, { useRef } from "react";

import { mapPinStyles } from './styles';

function MapPin({ spotInfo, price, onClickedMapPin }) {
  const styles = mapPinStyles();
  let pinRef = useRef(null);

  function mouseHover() {
    if (!pinRef.classList.contains('active')) {
      pinRef.classList.add('active');
    }

    let listingElement = document.getElementById(
      `spotListing${spotInfo.spotId}`
    );
    if (listingElement) {
      listingElement.style.transform = "scale(1.029)";
    }
  }

  function mouseLeave() {
    if (pinRef.classList.contains('active')) {
      pinRef.classList.remove('active');
    }

    let listingElement = document.getElementById(
      `spotListing${spotInfo.spotId}`
    );
    if (listingElement) {
      listingElement.style.transform = "scale(1)";
    }
  }

  function clickMapPin() {
    let nodes = document.getElementsByClassName(pinRef.classList[0]);

    for (let i = 0; i < nodes.length; i++) {
      if(nodes[i].classList.contains('active')) nodes[i].classList.remove('active');
    }

    pinRef.className += ' active';

    onClickedMapPin();
  }

  const number = Number.parseFloat(price).toFixed(2);
  const first = number.toString().split('.')[0];
  const last = number.toString().split('.')[1];

  return (
    <div
      ref={el => pinRef = el}
      onClick={() => clickMapPin()}
      onMouseEnter={mouseHover}
      onMouseOut={mouseLeave}
      id={`mapPin${spotInfo.spotId}`}
      className={styles.pinContainer}
      data-content={`$${first}.`}
    >
      {last}
    </div>
  );
}

export default MapPin;
