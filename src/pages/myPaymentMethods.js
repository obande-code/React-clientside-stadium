import React, { Component } from "react";
import PaymentMethodItem from "./paymentMethodItem";

//Redux
import { connect } from "react-redux";

//MUI
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import withStyles from "@material-ui/core/styles/withStyles";
import ListItem from "@material-ui/core/ListItem";

import List from "@material-ui/core/List";

import firebase from "firebase";

// import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./0-card-minimal";
import {CircularProgress} from "@material-ui/core";

// const stripePromise = loadStripe("pk_test_fBjUAdEgBIK3XRZQ3mOGsxAd00wMisVYso");

let userId;

// firebase.auth().onAuthStateChanged(function (user) {
//   if (user) {
//     userId = firebase.auth().currentUser.uid;
//   } else {
//     userId = "0";
//   }
// });

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(3),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  phoneNumGrid: {
    top: "20px",
  },
  containerRoot: {
    background: "white",
  },
  title: {
    //textDecoration: "underline",
    marginTop: 30,
  },
  loading: {
    marginTop: 20,
    textAlign: 'center',
    '& svg': {
      color: '#0f7277'
    }
  }
});

class MyPaymentMethods extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMethod: false,
      defaultMethod: "",
      stripeCustomerId: "",
      pmArray: [],
      loading: false,
    };

    userId = this.props.user.uid;
  }

  mapUserDetailsToState = (user) => {
    let method = this;

    let newRef = firebase
      .database()
      .ref("Users/" + userId + "/stripe/paymentMethods/");

    method.setState({
      loading: true,
    });

    newRef.on("value", function (snapshot) {

      if (snapshot.hasChild("isDefault")) {
        method.setState({
          isDefault: snapshot.child("isDefault").val(),
          isMethod: true,
          stripeCustomerId: snapshot.child("stripeCustomerId").val(),
          loading: true,
        });

        let getPaymentMethods = firebase
          .functions()
          .httpsCallable("getPaymentMethods");
        getPaymentMethods({
          customerID: snapshot.child("stripeCustomerID").val(),
        }).then(function (result) {

          method.setState({
            loading: false,
          });

          let i;
          let pmArray = [];
          for (i = 0; i < result.data.length; i++) {
            pmArray.push([
              result.data[i]["card"]["last4"],
              result.data[i]["card"]["brand"],
              result.data[i]["card"]["exp_month"],
              result.data[i]["card"]["exp_year"],
            ]);
          }

          method.setState({
            pmArray: pmArray,
          });
        });
      } else {
        method.setState({
          loading: false,
        });
      }
    });
  };

  componentDidMount() {
    const { user } = this.props;
    this.mapUserDetailsToState(user);
  }

  render() {
    const { classes } = this.props;
    const { loading } = this.state;
    return (
      <Container>
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item xs={12} sm={12} md={12} lg={6} xl={12}>
            <CheckoutForm
              userId={userId}
              customerId={this.state.stripeCustomerId}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            {loading ?
              <div className={classes.loading}>
                <CircularProgress color="inherit"/>
              </div> :
              <List>
                {this.state.pmArray.map((item) => {
                  return (
                    <ListItem>
                      <PaymentMethodItem
                        last4={item[0]}
                        brand={item[1]}
                        expMonth={item[2]}
                        expYear={item[3]}
                      />
                    </ListItem>
                  );
                })}
              </List>
            }
          </Grid>
        </Grid>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps)(withStyles(styles)(MyPaymentMethods));
