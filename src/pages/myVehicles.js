import React from "react";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import withStyles from "@material-ui/core/styles/withStyles";
import firebase from "firebase";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import List from "@material-ui/core/List";
import Link from '@material-ui/core/Link';
import CircularProgress from "@material-ui/core/CircularProgress";
import { toast } from 'react-toastify';

//Redux
import { connect } from "react-redux";
import PropTypes from "prop-types";

import CustomText from "../components/Atom/CustomText";

const useStyles = () => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20
  },
  btn: {
    width: 65,
    height: 40,
    marginLeft: 5
  },
  grid: {
    marginTop: 30,
  },
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 10,
    '& div': {
      borderRadius: 4,
      border: '1px solid #dee2e8',
      background: '#f8f9fb',
      padding: 22,
      width: '100%',
      marginRight: 12,
      '& a': {
        float: 'right',
        color: '#000000',
        textDecoration: 'underline',
        fontSize: 14
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

let userId;

//function to get firebase uid
/*firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    userId = firebase.auth().currentUser.uid;
  } else {
    userId = thi;
  }
});*/

class myVehicles extends React.Component {
  constructor(props) {
    super(props);

    //creates vehiclePlates array state
    this.state = {
      vehiclePlates: [],
      textError: false,
      loading: false,
      plateNumber: '',
    };

    userId = this.props.user.uid;
  }

  async getVehicles(n) {
    //this function retrieves all the vehicles within the users vehicle node
    let car = this;
    let loaded = false;

    car.setState({
      loading: true,
    });

    let query = firebase
      .database()
      .ref(`Users/${userId}/vehicles`)
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
      car.setState({
        vehiclePlates: plates,
        loading: false
      });

      if (!loaded) {
        loaded = true;
        car.setState({
          loading: false
        });
      } else {
        car.setState({
          loading: true
        });
      }
    });
  }

  componentDidMount() {
    // this is a react thing that runs before component is rendered
    // that way it pulls the data first and then renders
    this.getVehicles(0);
  }

  async writeUserData(userId) {
    let plateNumber = this.state.plateNumber;

    if (plateNumber === "") {
      this.setState({
        textError: true,
      });
    } else {

      let vehicles = this;

      vehicles.setState({
        textError: false,
        loading: true
      });

      //this function adds a new vehicle
      // newRef is reference to users vehicle node
      let newRef = firebase.database().ref("Users/" + userId + "/vehicles/");
      // newRef is reference to unique id for vehicle added
      let newRef2 = newRef.push();
      //this sets user inputed plate number as licence_plate under unique vehicle id

      newRef2.set({license_plate: plateNumber})
        .then(function() {
          toast.success('Vehicle added successfully!');
          vehicles.setState({
            loading: false,
            plateNumber: ''
          });
        })
        .catch(function(error) {
          toast.error(error.message);
          vehicles.setState({
            loading: false,
          });
        });

      // this updates the main node to identify which vehicle is the main vehicle, usually last one added
      await newRef.update(
        {
          main: { key: newRef2.key, value: plateNumber },
        },
        (error) => {
          if (error) {
            // toast.error('Vehicle added error!');
          } else {
            // toast.success('Vehicle added successfully!');
          }
        }
      );
    }
  }

  deleteVehicle(item) {
    //this function deletes the selected vehicle
    let lastAddedKey;
    let lastAddedVal;
    let bool = false;
    let newRef = firebase.database();

    newRef.ref("Users/" + userId + "/vehicles/" + item[0])
      .remove()
      .then(() => {
        toast.success('Vehicle successfully removed');
        this.setState({
          loading: false,
        })
      })
      .catch((error) => {
        toast.error(error.message);
        this.setState({
          loading: false,
        })
      });

    let count = this.state.vehiclePlates.length;

    let mainKey = newRef.ref("Users/" + userId + "/vehicles");

    if (count > 1) {
      mainKey
        .orderByChild("timestamp")
        .limitToLast(2)
        .on("child_added", function (snapshot) {
          if (snapshot.exists()) {
            if (snapshot.key !== "main") {
              lastAddedKey = snapshot.key;
              lastAddedVal = snapshot.child("/license_plate").val();
            }
            if (snapshot.key === "main") {
              // main = snapshot.child("/key").val();
              // mainVal = snapshot.child("/value").val();
              if (item[0] === snapshot.child("/key").val()) {
                bool = true;
              }
            }
            if (bool === true) {
              mainKey.child("/main").set({
                key: lastAddedKey,
                value: lastAddedVal,
              });
            }
          }
        });
    } else {
      newRef.ref("Users/" + userId + "/vehicles/main")
        .remove().then(function() {
          // toast.success('Vehicle successfully removed');
        })
        .catch(function(error) {
          // toast.error('Vehicle removed error');
        });
    }
  }

  handlePlateNumberChange(event) {
    this.setState({
      plateNumber: event.target.value
    })
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
          className={classes.grid}
        >
          <Card>
            <CardContent style={{ margin: '18px 22px' }}>
              <CustomText title={'Vehicles'} type={'title'} />
              <CustomText title={'Below is a list of all the vehicles you have registered with JustPark. You can also add new vehicles or delete old ones from this page.'} type={'description'} />
              <div className={classes.row}>
                <form>
                  <TextField
                    error={this.state.textError}
                    value={this.state.plateNumber}
                    onChange={(event) => this.handlePlateNumberChange(event)}
                    variant="outlined"
                    id="plateNumber"
                    label="Vehicle number plate"
                    size='small'
                    fullWidth
                  />
                </form>
                <Button
                  variant="contained"
                  className={classes.btn}
                  onClick={() => this.writeUserData(userId)}
                  color="primary"
                >
                  Add
                </Button>
              </div>


              {loading ?
                <div className={classes.loading}>
                  <CircularProgress color="inherit"/>
                </div> :
                <List>
                  {this.state.vehiclePlates.map((item, index) => {
                    return (
                      <div key={index} className={classes.listItem}>
                        <div>
                          {item[1]}
                          <Link href="#" onClick={() => this.deleteVehicle(item)}>
                            Delete Vehicle
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </List>
              }
            </CardContent>
          </Card>
        </Grid>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

myVehicles.propTypes = {
  user: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(withStyles(useStyles)(myVehicles));
