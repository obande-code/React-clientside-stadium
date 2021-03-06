import React, { Component } from "react";
import List from "@material-ui/core/List";
import Button from "@material-ui/core/Button";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { loadStripe } from "@stripe/stripe-js";
import withStyles from "@material-ui/core/styles/withStyles";
import { Elements } from "@stripe/react-stripe-js";
import firebase from "firebase";

import CustomText from "../components/Atom/CustomText";

import CheckoutForm from "./0-card-minimal";
import {CircularProgress} from "@material-ui/core";

const useStyles = () => ({
  title: {
    marginTop: 30,
  },
  field: {
    marginTop: 10,
    display: "block",
  },
  grid: {
    marginTop: 30,
  },
  detail: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 10,
    cursor: 'pointer',
    '& div': {
      borderRadius: 4,
      border: '1px solid #dee2e8',
      background: '#f8f9fb',
      padding: 22,
      width: '100%',
      marginRight: 12,
      '& b': {
        textTransform: 'uppercase'
      }
    }
  },
  loading: {
    marginTop: 20,
    textAlign: 'center',
    '& svg': {
      color: '#0f7277'
    }
  }
});

//Live stripe key
const stripePromise = loadStripe("pk_live_h54hF4yFeCfWfxV9K7jaAFxf00iW8QYuAM");

//Test stripe key
//const stripePromise = loadStripe("pk_test_fBjUAdEgBIK3XRZQ3mOGsxAd00wMisVYso");

/*const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    // Block native form submission.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.

      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements.getElement(CardElement);

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      console.log("[error]", error);
    } else {
      console.log("[PaymentMethod]", paymentMethod);

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

      //TODO: switch .on to .get() so it does not loop. Look at CheckoutPaymentButton.js
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
              // Read result of the Cloud Function.
              //let sanitizedMessage = result.data.text;
              console.log(result);
              // ...
            })
            .catch((error) => {
              // Getting the Error details.
              console.log(error);
              // ...
            });

          console.log("already is customer");
        } else {
          let createStripeCustomer = firebase
            .functions()
            .httpsCallable("createStripeCustomer");
          createStripeCustomer({
            email: "zsaadioui@gmail.com",
            name: "Zack Saadioui",
            firebaseUID: uid,
            paymentMethodID: paymentMethod.id,
            cardLast4Nums: paymentMethod.card["last4"],
            cardBrand: paymentMethod.card["brand"],
            expiration: dateStr,
          }).then(function (result) {
            // Read result of the Cloud Function.
            //let sanitizedMessage = result.data.text;
            console.log(result);
            // ...
          });
        }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ border: '1px solid #e6e9ed', padding: 12 }}>
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

      <Button style={{ textTransform: 'none' }} type="submit" disabled={!stripe}>
        + Add Payment Method
      </Button>
    </form>
  );
};*/

class checkoutPaymentInfo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isDefault: "",
      stripeCustomerId: "",
      brand: "",
      last4: "",
      expDate: "",
      pmArray: [],
      addPayment: false,
      paymentExists: false,
      loading: false,
    };
  }

  async getPaymentInfo(n) {
    let info = this;
    let newRef = firebase.database().ref("Users/" + this.props.user.uid);

    info.setState({
      loading: true,
    });

    newRef.on("value", function (snapshot) {
      if (snapshot.child("stripe").exists) {
        let isDefault = snapshot
          .child("stripe")
          .child("paymentMethods")
          .child("isDefault")
          .val();
        let stripeCustomerId = snapshot
          .child("stripe")
          .child("paymentMethods")
          .child("stripeCustomerID")
          .val();

        let getPaymentMethods = firebase
          .functions()
          .httpsCallable("getPaymentMethods");
        getPaymentMethods({
          customerID: stripeCustomerId,
        })
          .then(function (result) {
            info.setState({
              loading: false,
            });

            let i;
            let pmArray = [];
            let expDate;

            for (i = 0; i < result.data.length; i++) {
              if (result.data[i]["id"] === isDefault) {
                expDate =
                  result.data[i]["card"]["exp_month"] +
                  "/" +
                  result.data[i]["card"]["exp_year"].toString().slice(-2);

                info.setState({
                  isDefault: isDefault,
                  stripeCustomerId: stripeCustomerId,
                  brand: result.data[i]["card"]["brand"],
                  last4: result.data[i]["card"]["last4"],
                  expDate: expDate,
                  addPayment: false,
                  paymentExists: true,
                });
              }
              pmArray.push([
                result.data[i]["card"]["last4"],
                result.data[i]["card"]["brand"],
                expDate,
                result.data[i]["id"],
              ]);

              info.props.parentCallback(true);
            }

            info.setState({
              pmArray: pmArray,
            });
          })
          .catch((error) => {
            info.setState({
              loading: false,
            });
            // Getting the Error details.
            console.log(error);
            // ...
          });
      } else {
        info.setState({
          loading: false,
          paymentExists: false,
        });
      }
    });
  }

  selectMethod(item) {
    let info = this;
    //this function deletes the selected vehicle

    info.setState({
      isDefault: item[3],
      brand: item[1],
      last4: item[0],
      expDate: item[2],
    });

    info.props.parentCallback(true);
  }

  componentDidMount() {
    this.getPaymentInfo(0).then();
  }

  addPaymentMethod() {
    let add = this;

    if (add.state.addPayment === true) {
      add.setState({
        addPayment: false,
      });
    } else {
      add.setState({
        addPayment: true,
      });
    }
  }

  render() {
    const { classes } = this.props;
    const { loading } = this.state;
    return (
      <>
        {loading ?
          <div className={classes.loading}>
            <CircularProgress color="inherit"/>
          </div> :
          <div>
            {this.state.paymentExists ? (
              <div>
                {this.state.addPayment ? (
                  <div>
                    <Elements stripe={stripePromise}>
                      <CheckoutForm  userId={this.props.user.uid} />
                    </Elements>
                    <Button onClick={() => this.addPaymentMethod()}>cancel</Button>
                  </div>
                ) : (
                  <div>
                    <div className={classes.detail}>
                      <div><b>{this.state.brand}</b> ending in{" "}
                        {this.state.last4}</div>
                    </div>

                    <CustomText title='Select Payment Method' type="formTitle" mt={25} />

                    <List>
                      {this.state.pmArray.map((item, index) => {
                        if (item[3] === this.state.isDefault) {
                          return (
                            <div key={index} className={classes.detail} onClick={() => this.selectMethod(item)}>
                              <div style={{ backgroundColor: "lightgrey" }} ><b>{item[1]}</b> ending in {item[0]}</div>
                            </div>
                          );
                        } else {
                          return (
                            <div key={index} className={classes.detail} onClick={() => this.selectMethod(item)}>
                              <div><b>{item[1]}</b> ending in {item[0]}</div>
                            </div>
                          );
                        }
                      })}
                    </List>
                    <Button style={{ textTransform: 'none' }} onClick={() => this.addPaymentMethod()}>
                      + Add another payment method
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Elements stripe={stripePromise}>
                <CheckoutForm />
              </Elements>
            )}
          </div>
        }
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

checkoutPaymentInfo.propTypes = {
  user: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(withStyles(useStyles)(checkoutPaymentInfo));
