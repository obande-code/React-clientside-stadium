import React, { Component } from "react";

import Button from "@material-ui/core/Button";

import { connect } from "react-redux";
import PropTypes from "prop-types";

import firebase from "firebase";

import { Redirect } from "react-router-dom";

import Moment from "moment";
import 'moment-timezone';

import Loading from '../Loading'

import {CircularProgress} from "@material-ui/core";

import ReactGA from "react-ga";

class CheckoutPaymentButton extends Component {
  /*constructor(props) {
    super(props);
    console.log("props into checkout button");
    console.log(props);
    this.state = {
      paymentMethod: props.paymentMethod,
      customerID: props.customerID,
      email: props.email,
    };
  }*/

  state = {
    data: [],
    redirect: null,
    newBookingKey: null,
  };

  mapBookingDetailsToState = (data) => {
    this.setState({
      data: data,
    });
  };

  componentDidMount() {
    const { data } = this.props;
    this.mapBookingDetailsToState(data);
  }

  //TODO: replace hard coded user info with actual info from props/redux. Same with price
  payAction() {
    let redirect = this;

    redirect.setState({
      loading: true
    })
    let hostRef = firebase
      .database()
      .ref("Users/" + this.state.data.spot.owners_uid);

    let data = this.state.data;
    let customerID;
    let pmID;
    let user = this.props.user;
    let address = data.spot.street_number + " " + data.spot.street_name;
    let duration = data.timeDelta / 60000;
    let roundedDuration = Math.trunc(duration);

    let driverRef = firebase.database().ref("Users/" + user.uid);

    let startTime2 = Moment(data.startDate).utc().format("YYYY-MM-DD HH:mm");
    let realEndTime = Moment(data.endDate).utc().format("YYYY-MM-DD HH:mm");
    let displayStartTime = Moment(data.startDate).format("MMM DD, h:mm A");
    let displayEndTime = Moment(data.endDate).format("MMM DD, h:mm A");
    let roundedPrice = Number.parseFloat((data.price + (data.price * 0.10) + 0.30)).toFixed(2);
    let priceString = "$" + roundedPrice.toString();


    const bookingData = {
      address: address,
      date: startTime2, //Fix all dates
      displayEndTime: displayEndTime, //
      displayStartTime: displayStartTime, //
      duration: roundedDuration, //may need to turn back into seconds for DB
      endTime: realEndTime, //
      hostID: data.spot.owners_uid,
      instructions: data.spot.instructions,
      lat: data.spot.streetview_lat,
      long: data.spot.streetview_long,
      rating: 4, //Figure out rating system on web
      resID: "",
      review: "",
      spotID: data.spot.spotId,
      startTime: startTime2, //
      streetName: data.spot.street_name,
      totalPrice: roundedPrice, //may need to be a string to be same as ios
      unseen: "",
      userID: user.uid,
      vehicleColor: "", // might not need any vehicle info except plate number
      vehicleMake: "",
      vehicleModel: "",
      vehiclePlate: "clwn78",
    };

    driverRef
      .child("stripe")
      .child("paymentMethods")
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          customerID = snapshot.child("stripeCustomerID").val();
          pmID = snapshot.child("isDefault").val(); //need to find better way to get payment method that user chose at checkout

          console.log(`customerID is ${customerID} and pmID is ${pmID}`);

          hostRef
            .get()
            .then(function (snapshot) {
              if (snapshot.exists()) {
                console.log(snapshot.val());
                let hostConnectID = snapshot
                  .child("hostConnectAccountID")
                  .val();

                let chargeCustomer = firebase
                  .functions()
                  .httpsCallable("chargeCustomer");

                //let priceString = data.price.toString();
                //let priceParam = money.concat(priceString);
                //console.log(priceParam);
                let bookingKey = driverRef.push().key;
                chargeCustomer({
                  amount: priceString, //Need real price here but as a string not float
                  paymentMethod: pmID, //need to fix this
                  customerID: customerID, // and this
                  email: user.email,
                  resId: bookingKey,
                  hostConnectAccountID: hostConnectID,
                  spotId: data.spotId,
                  own: data.spot.owners_uid,
                  start: startTime2,
                  end: realEndTime,
                })
                  .then(function (result) {
                    // Read result of the Cloud Function.
                    //let sanitizedMessage = result.data.text;

                    //Payment was a success

                    bookingData.resID = bookingKey;
                    driverRef
                      .child("driver_bookings")
                      .child(bookingKey)
                      .set(bookingData);
                    hostRef
                      .child("host_bookings")
                      .child(bookingKey)
                      .set(bookingData);

                    redirect.setState({
                      redirect: "/bookinginfo",
                      newBookingKey: bookingKey,
                      loading: false
                    });
                  })
                  .catch((error) => {
                    // Getting the Error details.
                    console.log(error);
                    // ...
                  });
              } else {
                console.log("No data available");
              }
            })
            .catch(function (error) {
              console.error(error);
            });
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  handlePayAction = (event) => {
    this.payAction();
  };

  render() {
    const { loading } = this.state;

    if (this.state.redirect) {
      return (
        <Redirect
          to={{
            pathname: this.state.redirect,
            state: { foo: this.state.newBookingKey },
          }}
        />
      );
    }
    return (

      <div style={{marginTop: 12, marginBottom: 40}}>

        {loading ?

              <CircularProgress color="inherit"/>
            :

              <Button variant="contained" color='primary' fullWidth onClick={this.handlePayAction}
                      disabled={this.props.disabled}>
                {" "}
                Confirm and Pay
              </Button>

        }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  data: state.data,
  user: state.user,
});

CheckoutPaymentButton.propTypes = {
  data: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(CheckoutPaymentButton);
