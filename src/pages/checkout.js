import React, { Component } from "react";
import { Grid, Container, Card } from "@material-ui/core/";
import firebase from "firebase";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import CheckoutPersonalDetails from "./checkoutPersonalDetails";
import CheckoutPaymentInfo from "./checkoutPaymentInfo";

import { setUserData } from "../redux/actions/userActions";

import CustomText from "../components/Atom/CustomText";
import FirebaseUI from "../components/Auth/FirebaseUI";
import AccountInfo from "../components/DashBoard/My Profile/AccountInfo";
import CheckoutPaymentButton from "../components/Checkout/CheckoutPaymentButton";
import BookingSummary from "../components/Checkout/BookingSummary";
import { withStyles } from "@material-ui/core";


const styles = (theme) => ({
  container: {
    display: "flex",
    maxWidth: 1080,
    margin: "auto",
    [theme.breakpoints.down("sm")]: {
      display: "block",
      maxWidth: 502,
    },
  },
  card: {
    padding: "45px 35px",
    [theme.breakpoints.down("sm")]: {
      padding: 18,
    },
  },
  sidebar: {
    marginTop: 40,
    width: 394,
    flex: "0 0 auto",
    margin: "0 10px",
    [theme.breakpoints.down("sm")]: {
      width: "unset",
    },
  },
  form: {
    marginTop: 40,
    flex: "1 1 auto",
    margin: "0 10px",
  },
});

firebase.auth().onAuthStateChanged(function (user) {
  //window.location.reload();
});

//TODO: Handle state change of checkout button (disabled/enabled) depending on payment methods and user info
//Link user to some sort of receipt/confirmation page. Follow Justpark booking video
//Design all components and main checkout page
class checkout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: this.props.user.email,
      phoneNumber: this.props.user.phoneNumber,
      firstName: this.props.user.firstName,
      lastName: this.props.user.lastName,
      hasPayment: false,
      isReady: false,
    };
  }

  mapUserDetailsToState = (user) => {
    let userRef = this;

    if (user.firstName === "") {
      let newRef = firebase.database().ref("Users/" + user.uid);

      newRef.on("value", function (snapshot) {
        if (snapshot.child("firstName").val() !== "") {
          let userData = {
            email: snapshot.child("email").val(),
            phoneNumber: snapshot.child("phoneNumber").val(),
            firstName: snapshot.child("firstName").val(),
            lastName: snapshot.child("lastName").val(),
            uid: snapshot.child("id").val(),
          };
          userRef.setState({
            email: snapshot.child("email").val(),
            phoneNumber: snapshot.child("phoneNumber").val(),
            firstName: snapshot.child("firstName").val(),
            lastName: snapshot.child("lastName").val(),
          });

          userRef.props.setUserData(userData);
        }
      });
    }

    /*this.setState({
      email: user.email ? user.email : "",
      phoneNumber: user.phoneNumber ? user.phoneNumber : "",
      displayName: user.displayName ? user.displayName : "",
      firstName: user.firstName ? user.firstName : "",
      lastName: user.lastName ? user.lastName : "",
      uid: user.uid ? user.uid : "",
    });*/
  };

  //callback to make sure payment button is diabled until payment method is added
  pmCallback(hasInfo) {
    this.setState({
      hasPayment: hasInfo,
    });
  }

  //callback to make sure payment button is diabled until all the proper info is added for user Account
  userCallback(hasInfo) {
    this.setState({
      isReady: hasInfo,
    });
  }

  componentDidMount() {
    const { user } = this.props;
    this.mapUserDetailsToState(user);

  }

  render() {
    const { classes, user } = this.props;

    let display = "";
    var hasUserInfo = false;

    if (
      user.email === "" ||
      user.phoneNumber === "" ||
      user.firstName === undefined ||
      user.lastName === ""
    ) {
      display = <AccountInfo />;
    } else {
      display = (
        <CheckoutPersonalDetails
          parentCallback={(hasInfo) => {
            this.userCallback(hasInfo);
          }}
        />
      );
    }

    const isAuthenticated = this.props.user.authenticated;

    this.mapUserDetailsToState(user);

    return (
      <div className={classes.container}>
        <div className={classes.sidebar}>
          <BookingSummary />
        </div>
        <div className={classes.form}>
          <Card className={classes.card}>
            <CustomText title="1. Personal Details" type="title" />
            {isAuthenticated ? display : <FirebaseUI />}
          </Card>

          <Card
            className={classes.card}
            style={{
              marginTop: 25,
              marginBottom: 20,
            }}
          >
            <CustomText title="2. Payment Information" type="title" />
            <CheckoutPaymentInfo
              key={this.state.firstName}
              parentCallback={(hasInfo) => {
                this.pmCallback(hasInfo);
              }}
            />
          </Card>

          <CheckoutPaymentButton
            disabled={
              this.state.hasPayment !== true || this.state.isReady !== true
            }
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});
const mapActionsToProps = {
  setUserData,
};

checkout.propTypes = {
  user: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default connect(
  mapStateToProps,
  mapActionsToProps
)(withStyles(styles)(checkout));
