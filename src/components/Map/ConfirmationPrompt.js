import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import { Tab, Tabs, withStyles } from "@material-ui/core";
import DirectionsWalkIcon from "@material-ui/icons/DirectionsWalk";
import CloseIcon from "@material-ui/icons/Close";
import Rating from "@material-ui/lab/Rating";
import Lightbox from "react-image-lightbox";
import ShowMoreText from "react-show-more-text";
import "react-image-lightbox/style.css";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import { setSpaceData } from "../../redux/actions/dataActions";

import { ReactComponent as InforBox } from "../../images/infobox.svg";
import { ReactComponent as StreetView } from "../../images/streetview.svg";
import { ReactComponent as Sheltered } from "../../images/sheltered.svg";
import { ReactComponent as CCTV } from "../../images/cctv.svg";
import { ReactComponent as Guarded } from "../../images/guarded.svg";
import { ReactComponent as Wide } from "../../images/wide.svg";
import { ReactComponent as Charging } from "../../images/charging.svg";
import { ReactComponent as Lighting } from "../../images/lighting.svg";
import { ReactComponent as Gated } from "../../images/gated.svg";
import Review from "./Review"

import confirmationPromptStyles from "./styles";

import firebase from "firebase/app";

class ConfirmationPrompt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spot: props.spot,
      tabValue: 0,
      galleryIndex: 0,
      openGallery: false,
      facilitiesShowMore: false,
      textShowMore: false,
    };
  }

  componentDidMount() {
    let facilities = {
      sheltered: this.props.spot.covered,
      cctv: this.props.spot.camera,
      guarded: this.props.spot.guarded,
      wide: this.props.spot.covered,
      charging: this.props.spot.charging,
      lighting: this.props.spot.lit,
      gated: this.props.spot.gated,
    };

    firebase.analytics().logEvent('viewed_listing', { spotID: this.state.spot.spotId})

    this.setState((prevState) => ({
      spot: {
        ...prevState.spot,
        facilities: facilities,
      },
    }));
    this.getImages(this.props.spot);
  }

  componentDidUpdate(prevProps, prevState) {
    // Typical usage (don't forget to compare props):

    if (this.props.spot.spotId !== this.state.spot.spotId || this.props.spot !== prevProps.spot) {
      this.getImages(this.props.spot);
      this.render()
    }
  }

  getImages = (listing) => {
    var storage = firebase.storage();
    var numImages = listing.number_of_images;
    var spotId = listing.spotId;
    var uid = listing.owners_uid;
    var gallery = [];

    console.log(`heloooooo confirmationprompt ${uid}      ${spotId}`);

    for (var i = 1; i <= numImages; i++) {
      const imageRef = storage.ref(`listingImages/${uid}/${spotId}/image${i}`);

      //Using the path this downloads the image and sets it as the source for the image with id = spotId
      //if (!this.state.imageLoaded) {
      imageRef
        .getDownloadURL()
        .then((url) => {
          // var img = document.getElementById(listing.spotId);
          // img.setAttribute("src", url);
          // imageURL = url;
          //this.setState({ imageURL: url, imageLoaded: true });
          gallery.push(url);
          console.log(url);
          this.setState({
            galleryImages: gallery,
          });
        })
        .catch((error) => {
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case "storage/object-not-found":
              // File doesn't exist
              break;
            case "storage/unauthorized":
              // User doesn't have permission to access the object
              break;
            case "storage/canceled":
              // User canceled the upload
              break;

            // ...

            case "storage/unknown":
              // Unknown error occurred, inspect the server response
              break;
            default:
              break;
          }
        });
      //}
      this.setState({
        galleryImages: gallery,
        spot: listing,
      });
      this.forceUpdate();
    }
  };

  displayHumanReadableDate(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    let pm = "AM";
    if (hours >= 12) {
      pm = "PM";
      hours = hours - 12;
    }
    return `${
      date.getMonth() + 1
    }/${date.getDate()}/${date.getFullYear()}  ${hours}:${minutes} ${pm}`;
  }

  handleConfirm = () => {
    this.props.setSpaceData(this.props, this.props.history);
  };

  handleTabsChange = (event, newValue) => {
    this.setState({ tabValue: newValue });
  };

  render() {
    const {
      tabValue,
      galleryIndex,
      openGallery,
      facilitiesShowMore,
      textShowMore,
    } = this.state;
    const { classes } = this.props;

    return (
      <div id="confirmationPrompt" className={classes.confirmContainer}>
        <CloseIcon
          className={classes.closeIcon}
          onClick={() => {
            this.props.cancelCallback();
          }}
        />
        <div className={classes.confirmData}>
          <div className={classes.spotName}>
            <span>RESERVABLE </span>
            <span>{this.props.spot.spot_name}</span>
            {" on "}
            <span>
              {this.props.spot.city} {this.props.state}
              {", "}
              {this.props.spot.postal_code}
            </span>
          </div>
          <div className={classes.spotRating}>
            <Rating
              value={this.props.ratingAverage || 5}
              size="small"
              readOnly
            />
            <p>({this.props.ratingNumber})</p>
          </div>
          <div className={classes.bookingDate}>
            <div className={classes.bookingDateDetail}>
              <span>Parking From</span>
              <span>{this.displayHumanReadableDate(this.props.startDate)}</span>
            </div>
            <div className={classes.sep} />
            <div className={classes.bookingDateDetail}>
              <span>Parking Until</span>
              <span>{this.displayHumanReadableDate(this.props.endDate)}</span>
            </div>
          </div>
          <div className={classes.standoutBar}>
            <div className={classes.standoutBarItem}>
              <div className={classes.standoutBarItemValue}>
                {((this.props.timeDelta / 60 / 60 / 1000) % 1) !== 0 ? (this.props.timeDelta / 60 / 60 / 1000).toFixed(1) : (this.props.timeDelta / 60 / 60 / 1000).toFixed(0)}h
              </div>
              <div className={classes.standoutBarItemTitle}>Total Duration</div>
            </div>
            <div className={classes.standoutBarItem}>
              <div className={classes.standoutBarItemValue}>
                ${Number.parseFloat(this.props.spot.bookingPrice).toFixed(2)}
              </div>
              <div className={classes.standoutBarItemTitle}>Total Price</div>
            </div>
            <div className={classes.standoutBarItem}>
              {<div className={classes.standoutBarItemValue}>
                <DirectionsWalkIcon className={classes.workIcon} />
                {this.props.spot.walkTime ? this.props.spot.walkTime.slice(0,7) : " "}
              </div>}
              <div className={classes.standoutBarItemTitle}>To Destination</div>
            </div>
          </div>
          <div className={classes.confirmSelect}>
            <Button variant="contained" onClick={this.handleConfirm}>
              Reserve for ${Number.parseFloat(this.props.price).toFixed(2)}
            </Button>
          </div>
        </div>
        <Tabs
          value={tabValue}
          onChange={this.handleTabsChange}
          variant="fullWidth"
          indicatorColor="primary"
          aria-label="Information"
          className={classes.tabs}
        >
          <Tab label="Information" {...a11yProps(0)} className={classes.tab} />
          <Tab label="Reviews" {...a11yProps(1)} className={classes.tab} />
          <Tab label="How to Park" {...a11yProps(2)} className={classes.tab} />
        </Tabs>
        <TabPanel value={tabValue} index={0}>
          <div className={classes.tabContent}>
            <ul className={classes.facilities}>
              {this.state.spot.facilities &&
                Object.keys(this.state.spot.facilities).map(
                  (keyName, index) => {
                    if (this.state.spot.facilities[keyName]) {
                      if (
                        !facilitiesShowMore &&
                        Object.keys(this.state.spot.facilities).length > 4 &&
                        index === 3
                      ) {
                        return (
                          <li key={index}>
                            <div
                              style={{
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                this.setState({
                                  facilitiesShowMore: true,
                                })
                              }
                            >
                              <p className={classes.facilitiesCount}>
                                +
                                {Object.keys(this.state.spot.facilities)
                                  .length - 3}
                              </p>
                              <p className={classes.facilitiesText}>
                                Show All Facilities
                              </p>
                            </div>
                          </li>
                        );
                      }
                      if (
                        facilitiesShowMore ||
                        Object.keys(this.state.spot.facilities).length <= 4 ||
                        (Object.keys(this.state.spot.facilities).length > 4 &&
                          index < 3)
                      ) {
                        return (
                          <li key={index}>
                            {keyName === "sheltered" ? (
                              <>
                                <Sheltered />
                                <p>Sheltered</p>
                              </>
                            ) : keyName === "cctv" ? (
                              <>
                                <CCTV />
                                <p>CCTV</p>
                              </>
                            ) : keyName === "wide" ? (
                              <>
                                <Wide />
                                <p>Wide</p>
                              </>
                            ) : keyName === "charging" ? (
                              <>
                                <Charging />
                                <p>Charging</p>
                              </>
                            ) : keyName === "lighting" ? (
                              <>
                                <Lighting />
                                <p>Lighting</p>
                              </>
                            ) : keyName === "guarded" ? (
                              <>
                                <Guarded />
                                <p>Guarded</p>
                              </>
                            ) : (
                              <>
                                <Gated />
                                <p>Gated</p>
                              </>
                            )}
                          </li>
                        );
                      }
                    }
                  }
                )}
            </ul>
            <div className={classes.content}>
              <ShowMoreText
                lines={3}
                more="Read more"
                less="Read less"
                anchorClass={`showText ${!textShowMore ? "more" : "less"}`}
                onClick={() =>
                  this.setState((prev) => ({
                    textShowMore: !prev.textShowMore,
                  }))
                }
                expanded={false}
              >
                {this.props.spot.description}
              </ShowMoreText>
            </div>
            <Link
              to={{
                pathname: "/streetview",
                state: {
                  lat: this.state.spot.streetview_lat,
                  long: this.state.spot.streetview_long,
                },
              }}
            >
              <Button variant="outlined" className={classes.streetView}>
                <StreetView />
                View streetview
              </Button>
            </Link>
            <div className={classes.gallery}>
              {this.state.galleryImages &&
                this.state.galleryImages.map((galleryItem, index) => {
                  return (
                    index < 2 && (
                      <div
                        key={index}
                        className={classes.galleryItem}
                        onClick={() =>
                          this.setState({
                            openGallery: true,
                          })
                        }
                      >
                        <img src={galleryItem} alt={"Gallery" + index} />
                      </div>
                    )
                  );
                })}
              {openGallery && (
                <Lightbox
                  mainSrc={this.state.galleryImages[galleryIndex]}
                  nextSrc={
                    this.state.galleryImages[
                      (galleryIndex + 1) % this.state.galleryImages.length
                    ]
                  }
                  prevSrc={
                    this.state.galleryImages[
                      (galleryIndex + this.state.galleryImages.length - 1) %
                        this.state.galleryImages.length
                    ]
                  }
                  onCloseRequest={() =>
                    this.setState({
                      openGallery: false,
                    })
                  }
                  onMovePrevRequest={() =>
                    this.setState({
                      galleryIndex:
                        (galleryIndex + this.state.galleryImages.length - 1) %
                        this.state.galleryImages.length,
                    })
                  }
                  onMoveNextRequest={() =>
                    this.setState({
                      galleryIndex:
                        (galleryIndex + 1) % this.state.galleryImages.length,
                    })
                  }
                />
              )}
            </div>
          </div>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <div className={classes.tabContent}>
            <ul className={classes.reviews}>
              <Review spot={this.props.spot} />
            </ul>
          </div>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <div className={classes.tabContent}>
            <div className={classes.park}>
              <ul>
                <li>
                  <img
                    src="https://static.justpark.com/web/assets/how_to_park_step_1.ce4b0e3678d133c8d1a6eacc7a2cac2c.svg"
                    alt=""
                  />
                  <div>
                    <p>Once you've paid</p>
                    <p>
                      You'll receive directions to the space and information on
                      how to access it
                    </p>
                  </div>
                </li>
                <li>
                  <img
                    src="https://static.justpark.com/web/assets/how_to_park_step_2.52e2e3afd128227abee1de544b2a82a1.svg"
                    alt=""
                  />
                  <div>
                    <p>
                      You'll receive directions to the space and information on
                      how to access it
                    </p>
                  </div>
                </li>
                <li>
                  <img
                    src="https://static.justpark.com/web/assets/how_to_park_step_3.694fd32d112fe4920944161ef0d75ed7.svg"
                    alt=""
                  />
                  <div>
                    <p>
                      You'll receive directions to the space and information on
                      how to access it
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </TabPanel>
      </div>
    );
  }
}

ConfirmationPrompt.propTypes = {
  setSpaceData: PropTypes.func.isRequired,
};

function a11yProps(index) {
  return {
    id: `listings-tab-${index}`,
    "aria-controls": `listings-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`listings-tabpanel-${index}`}
      aria-labelledby={`listings-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

const mapActionsToProps = {
  setSpaceData,
};

const mapStateToProps = (state) => ({
  listing: state.listing,
});

export default withRouter(
  connect(
    mapStateToProps,
    mapActionsToProps
  )(withStyles(confirmationPromptStyles)(ConfirmationPrompt))
);
