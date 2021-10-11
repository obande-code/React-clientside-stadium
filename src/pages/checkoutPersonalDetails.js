import React, { Component } from "react";
import List from "@material-ui/core/List";
import Button from "@material-ui/core/Button";
import withStyles from "@material-ui/core/styles/withStyles";
import { Container, TextField } from "@material-ui/core";
import firebase from "firebase";
import firebaseInstance from "firebase/app";

//Redux
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { setVehicleData } from "../redux/actions/dataActions";
import CustomText from "../components/Atom/CustomText";

const useStyles = (theme) => ({
  personalDetail: {
    marginTop: 28,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 20,
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
  actionBtns: {
    minWidth: 140,
  },
  btn: {
    width: 65,
    height: 40,
    marginLeft: 5,
    fontSize: 12,
    [theme.breakpoints.down("xs")]: {
      marginTop: 5,
      marginLeft: 0,
      marginRight: 5,
    },
  },
  detail: {
    display: "flex",
    flexDirection: "row",
    marginTop: 10,
    cursor: "pointer",
    "& div": {
      borderRadius: 4,
      border: "1px solid #dee2e8",
      background: "#f8f9fb",
      width: "100%",
      padding: 18,
      marginRight: 12,
    },
  },
});

let userId;

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    userId = firebase.auth().currentUser.uid;
  } else {
    userId = "0";
  }
});

class checkoutPersonalDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      email: "",
      phoneNumber: "",
      vehicle: "",
      vehicleId: "",
      addingNewVehicle: "",
      vehiclePlates: [],
      editDetails: false,
      shouldAddNew: false,
    };
  }

  async getPersonalDetails(n) {
    let info = this;
    let newRef = firebase.database().ref("Users/" + this.props.user.uid);

    newRef.on("value", function (snapshot) {
      let fullName =
        snapshot.child("firstName").val() +
        " " +
        snapshot.child("lastName").val();
      let email = snapshot.child("email").val();
      let phoneNumber = snapshot.child("phoneNumber").val();
      let vehicle = snapshot
        .child("vehicles")
        .child("main")
        .child("value")
        .val();
      let vehicleId = snapshot
        .child("vehicles")
        .child("main")
        .child("key")
        .val();

      let shouldAddNew = false;

      shouldAddNew = vehicle != null;
      if (vehicle != null) {
        info.props.parentCallback(true);
      }

      info.setState({
        name: fullName,
        email: email,
        phoneNumber: phoneNumber,
        vehicle: vehicle,
        vehicleId: vehicleId,
        shouldAddNew: shouldAddNew,
      });
    });
  }

  selectVehicle(item) {
    let info = this;
    //this function deletes the selected vehicle

    info.setState({
      vehicle: item[1],
      vehicleId: item[0],
    });

    //this.props.setVehicleData(this.state.vehicle);

    this.saveChanges();
    firebaseInstance.analytics().logEvent('vehicle_added')

    info.props.parentCallback(true);
  }

  saveChanges() {
    let save = this;

    save.setState({
      editDetails: false,
    });
  }

  clickEdit() {
    let edit = this;

    let query = firebase
      .database()
      .ref(`Users/${this.props.user.uid}/vehicles`)
      .orderByKey();
    query.on("value", function (snapshot) {
      let plates = [];
      // let num = [];
      snapshot.forEach(function (childSnapshot) {
        // gets vehicle unique id
        let key = childSnapshot.key;

        // gets vehicle license plate
        let childData = childSnapshot.child("license_plate").val();
        //pushes both to plates array

        if (key !== "main") {
          plates.push([key, childData]);
        }
      });

      //set state to vehiclePlates to re-render
      edit.setState({
        vehiclePlates: plates,
        editDetails: true,
      });
    });
  }

  async writeUserData(userId, plateNumber) {
    if (plateNumber === "") {
      this.setState({
        textError: true,
      });
    } else {
      this.setState({
        textError: false,
      });
      //this function adds a new vehicle

      // newRef is reference to users vehicle node
      let newRef = firebase.database().ref("Users/" + userId + "/vehicles/");
      // newRef is reference to unique id for vehicle added
      let newRef2 = newRef.push();
      //this sets user inouted plate number as licence_plate under unique vehicle id
      newRef2.set(
        {
          license_plate: plateNumber,
        },
        (error) => {
          if (error) {
            // The write failed...
          } else {
            // Data saved successfully!
            this.props.parentCallback(true);
          }
        }
      );

      //this updates the main node to identify which vehicle is the main vehicle, usually last one added
      await newRef.update(
        {
          main: { key: newRef2.key, value: plateNumber },
        },
        (error) => {
          if (error) {
            // The write failed...
          } else {
            // Data saved successfully!
          }
        }
      );
    }
  }

  componentDidMount() {
    this.getPersonalDetails(0);
  }

  addNewVehicleSetting() {
    this.setState({
      shouldAddNew: false,
    });
  }

  cancelAdd() {
    this.setState({
      shouldAddNew: true,
      editDetails: false,
    });
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.personalDetail}>
        <CustomText
          title={`${this.props.user.firstName} ${this.props.user.lastName}`}
          type="formTitle"
        />
        <CustomText title={this.props.user.email} type="description" />
        <CustomText title={this.props.user.phoneNumber} type="description" />

        {this.state.shouldAddNew ? (
          <div>
            {/* <Button onClick={() => this.clickEdit()}>edit</Button> */}
            {this.state.editDetails ? (
              <Container style={{ padding: 0, marginTop: 16 }}>
                <CustomText title="Select Vehicle" type="formTitle" />
                <List style={{ padding: 0 }}>
                  {this.state.vehiclePlates.map((item) => {
                    return (
                      <div
                        className={classes.detail}
                        onClick={() => this.selectVehicle(item)}
                      >
                        <div>{item[1]}</div>
                      </div>
                    );
                  })}
                </List>

                <Button onClick={() => this.addNewVehicleSetting()}>
                  + Add another vehicle
                </Button>
              </Container>
            ) : (
              <div onClick={() => this.clickEdit()} className={classes.detail}>
                <div>{this.state.vehicle}</div>
              </div>
            )}
          </div>
        ) : (
          <div className={classes.row}>
            <form>
              <TextField
                error={this.state.textError}
                id="plateNumber"
                label="Enter vehicle number plate"
                color="primary"
                fullWidth
                size="small"
                variant="outlined"
              />
            </form>
            <div className={classes.actionBtns}>
              <Button
                className={classes.btn}
                onClick={() =>
                  this.writeUserData(
                    userId,
                    document.getElementById("plateNumber").value
                  )
                }
                color="primary"
                variant="contained"
              >
                Add
              </Button>
              {this.state.vehiclePlates.length > 0 && (
                <Button
                  className={classes.btn}
                  onClick={() => this.cancelAdd()}
                  variant="contained"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  vehicle: state.vehicle,
  user: state.user,
});

const mapActionsToProps = {
  setVehicleData,
};

checkoutPersonalDetails.propTypes = {
  vehicle: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default connect(
  mapStateToProps,
  mapActionsToProps
)(withStyles(useStyles)(checkoutPersonalDetails));
