import React, { useState } from "react";
import { connect } from "react-redux";
import { Button, Card, CircularProgress } from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
  // CardNumberElement,
} from "@stripe/react-stripe-js";
import firebase from "firebase";
import PropTypes from "prop-types";
import { toast } from 'react-toastify';
import CustomText from "../components/Atom/CustomText";

//import "../styles/common.css";

// firebase.auth().onAuthStateChanged(function (user) {
//   if (user) {
//     userId = firebase.auth().currentUser.uid;
//   } else {
//     userId = "0";
//   }
// });

const CheckoutForm = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  const userId = props.uid;

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    // Block native form submission.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.

      return;
    }

    /**
     * Get a reference to a mounted CardElement. Elements knows how
     * to find your CardElement because there can only ever be one of
     * each type of element.
     */

    const cardElement = elements.getElement(CardElement);

    setLoading(true);

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      setLoading(false);
      toast.error(error.message);
    } else {
      let expYear = paymentMethod.card["exp_year"];
      let expMonth = paymentMethod.card["exp_month"];
      let dateStr;
      if (expMonth < 10) {
        dateStr =
          "0" + expMonth.toString() + "/" + expYear.toString().slice(-2);
      }

      let newRef = firebase
        .database()
        .ref("Users/" + userId + "/stripe/paymentMethods/");

      newRef.on("value", function (snapshot) {
        if (snapshot.hasChild("isDefault")) {
          let linkCustomerToPaymentMethod = firebase
            .functions()
            .httpsCallable("linkCustomerToPaymentMethod");
          linkCustomerToPaymentMethod({
            stripeCustomerID: snapshot.child("stripeCustomerID").val(),
            paymentMethodID: paymentMethod.id,
          })
            .then(function (result) {
              setLoading(false);
              toast.success('Card added successfully');
              console.log(result);
            })
            .catch((error) => {
              setLoading(false);
              toast.error('Adding card Failed');
              console.log(error);
            });
        } else {
          let createStripeCustomer = firebase
            .functions()
            .httpsCallable("createStripeCustomer");
          createStripeCustomer({
            email: props.email,
            name: props.firstName + " " + props.lastName,
            firebaseUID: props.uid,
            paymentMethodID: paymentMethod.id,
            cardLast4Nums: paymentMethod.card["last4"],
            cardBrand: paymentMethod.card["brand"],
            expiration: dateStr,
          }).then(function (result) {
            setLoading(false);
            toast.success('Card added successfully');
            console.log(result);
          });
        }
      });
    }
  };

  return (
    <>
      {loading && (
        <div style={{ marginTop: 20, textAlign: "center", color: '#0f7277' }}>
          <CircularProgress color="inherit" />
        </div>
      )}
      <form onSubmit={handleSubmit} style={{display: loading ? 'none': 'block'}}>
        <>
          <div style={{ border: "1px solid #e6e9ed", padding: 12 }}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#9e2146",
                  },
                },
              }}
            />
          </div>
          <Button
            style={{ textTransform: "none" }}
            type="submit"
            disabled={!stripe}
          >
            + Add Payment Method
          </Button>
        </>
      </form>
    </>
  );
};

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.

//Live stripe key
const stripePromise = loadStripe("pk_live_h54hF4yFeCfWfxV9K7jaAFxf00iW8QYuAM");

//Test stripe key
//const stripePromise = loadStripe("pk_test_fBjUAdEgBIK3XRZQ3mOGsxAd00wMisVYso");

const App = (props) => {
  const { classes } = props;

  return (
    <Elements stripe={stripePromise}>
      <Card className={classes.card}>
        <CustomText title="Payment methods" type="title" />
        <br />
        <CustomText
          title="Below is a list of all the payment methods you have registered with Prked. You can also add new payment methods or delete old ones from this page."
          type="description"
        />
        <br />
        <CheckoutForm
          email={props.user.email}
          uid={props.user.uid}
          firstName={props.user.firstName}
          lastName={props.user.lastName}
        />
      </Card>
    </Elements>
  );
};

const useStyles = () => ({
  card: {
    marginTop: 30,
    padding: 27,
  },
});

const mapStateToProps = (state) => ({
  user: state.user,
});

App.propTypes = {
  user: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(
  withStyles(useStyles)(App, CheckoutForm)
);
