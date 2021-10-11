import React, { Component } from "react";
import { Link } from "react-router-dom";
import firebase from "firebase";
import { connect } from "react-redux";
import {Grid, Container, Button, withStyles, CircularProgress} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import CustomText from "../../Atom/CustomText";

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
    margin: "30px 0 20px",
  },
  addButton: {
    color: "#999",
    padding: "20px 0",
    border: "1px dashed #cdd3db",
    borderRadius: "0",
    background: "#f8f9fb",
  },
  viewText: {
    textDecoration: "underline",
    fontSize: 13,
    fontFamily: "Nunito,Avenir,sans-serif",
    cursor: "pointer",
    textTransform: "none",
  },
  listItem: {
    width: "100%",
    marginTop: 10,
    marginBottom: 25,
    "& div": {
      borderRadius: 4,
      border: "1px solid #dee2e8",
      background: "#f8f9fb",
      padding: 22,
      marginRight: 12,
    },
  },
  loading: {
    marginTop: 20,
    textAlign: 'center',
    '& svg': {
      color: '#0f7277'
    }
  }
});

class PaymentMethods extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMethod: false,
      defaultMethod: "",
      stripeCustomerId: "",
      output: "",
      defaultBrand: "",
      defaultLast4: "",
      defaultExpDate: "",
      pmArray: [],
      loading: false,
    };

    userId = this.props.user.uid;
  }

  mapUserDetailsToState = (user) => {
    let car = this;
    let newRef = firebase
      .database()
      .ref("Users/" + userId + "/stripe/paymentMethods/");

    car.setState({
      loading: true,
    });

    newRef.on("value", function (snapshot) {
      if (snapshot.hasChild("isDefault")) {
        let getPaymentMethods = firebase
          .functions()
          .httpsCallable("getPaymentMethods");
        getPaymentMethods({
          customerID: snapshot.child("stripeCustomerID").val(),
        }).then(function (result) {
          car.setState({
            loading: false,
          });

          // Read result of the Cloud Function.
          //let sanitizedMessage = result.data.text;

          let i;
          let pmArray = [];
          for (i = 0; i < result.data.length; i++) {
            pmArray.push(result.data[i]);
            if (result.data[i]["id"] === snapshot.child("isDefault").val()) {
              let expDate =
                result.data[i]["card"]["exp_month"] +
                "/" +
                result.data[i]["card"]["exp_year"].toString().slice(-2);

              car.setState({
                isDefault: snapshot.child("isDefault").val(),
                isMethod: true,
                stripeCustomerId: snapshot.child("stripeCustomerID").val(),
                output: result.data[i]["id"],
                defaultBrand: result.data[i]["card"]["brand"],
                defaultLast4: result.data[i]["card"]["last4"],
                defaultExpDate: expDate,
                pmArray: pmArray,
              });
            }
          }

          // ...
        });
      } else {
        car.setState({
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
      <Container style={{ margin: "20px 0 15px" }}>
        <CustomText title="Payment Methods" type="title" />

        {loading ?
          <div className={classes.loading}>
            <CircularProgress color="inherit"/>
          </div> :
          <Grid container spacing={2} style={{ marginTop: "20px" }}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <CustomText
                type="description"
                title={
                  this.state.isMethod
                    ? 'Your most recently used payment method is listed below. To add more, or view all your payment methods, please click the "View more details" link.'
                    : "You have no payment methods added. Click below to add your first payment method."
                }
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              {this.state.isMethod ? (
                <Grid>
                  <div className={classes.listItem}>
                    <div>
                      {this.state.defaultBrand +
                      " - " +
                      this.state.defaultLast4 +
                      " " +
                      this.state.defaultExpDate}
                    </div>
                  </div>
                  <Button
                    to="/paymentmethods"
                    component={Link}
                    className={classes.viewText}
                    disableRipple={true}
                    disableElevation={true}
                    variant="text"
                  >
                    View more details
                  </Button>
                </Grid>
              ) : (
                <Button
                  fullWidth
                  variant="outlined"
                  to="/paymentmethods"
                  component={Link}
                  onClick={this.handleSubmit}
                  startIcon={<AddIcon />}
                  className={classes.addButton}
                >
                  Click To Add a Payment Method
                </Button>
              )}
            </Grid>
          </Grid>
        }
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps)(withStyles(styles)(PaymentMethods));
