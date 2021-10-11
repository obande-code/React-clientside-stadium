// Import FirebaseAuth and firebase.
import React from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "../../util/firebase";
import { Grid, Container, withStyles } from "@material-ui/core";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { setUserData, saveUserData } from "../../redux/actions/userActions";

import ReactGA from 'react-ga';
import firebaseInstance from "firebase/app";

// Configure FirebaseUI.
const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: "popup",
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  // signInSuccessUrl: "/dashboard/profile",
  // We will display Google and Facebook as auth providers.
  signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    //firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    //"apple.com",
  ],
  callbacks: {
    //  redirects after sign-in.
    /*signInSuccessWithAuthResult: function (authResult, redirectUrl) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      return true;*/
    signInSuccessWithAuthResult: () => false,
    //},
  },
};

const styles = (theme) => ({
  root: {
    marginTop: 30,
    borderRadius: 4,
    [theme.breakpoints.down('xs')]: {
      padding: 20,
      marginTop: 0,
      height: 'calc(100vh - 70px)',
    },
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '300',
    lineHeight: '1.4',
    flex: '0 0 75%',
    maxWidth: '75%',
    margin: '10px 0',
    [theme.breakpoints.down('xs')]: {
      flex: '0 0 100%',
      maxWidth: '100%',
      fontSize: '1.0625rem',
    },
  },
  footer: {
    borderTop: '1px solid #dfdfdf',
    marginTop: 15,
    '& p': {
      color: '#94a7bb',
      letterSpacing: 0,
      padding: '20px 20px 0',
      margin: 0,
      '& a[href]': {
        textDecoration: 'none',
        lineHeight: '1',
        color: '#0f7277',
      }
    }
  }
});

class FirebaseUI extends React.Component {
  constructor(props) {
    super(props);
    // console.log(props);
    this.state = {
      authenticated: false,
      credentials: {},
    };
  }

  // Listen to the Firebase Auth state and set the local state.
  componentDidMount() {
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ authenticated: !!user, credentials: user });
        let firstName = "";
        let lastName = "";
        if (user.displayName) {
          const nameArray = user.displayName.split(" ");
          firstName = nameArray[0];
          lastName = nameArray[1];
        }

        const created = user.metadata.creationTime;
        const lastSignin = user.metadata.lastSignInTime;

        const userData = {
          email: user.email ? user.email : "",
          phoneNumber: user.phoneNumber ? user.phoneNumber : "",
          uid: user.uid,
          displayName: user.displayName ? user.displayName : "",
          firstName: firstName,
          lastName: lastName,
          created: created,
          lastSignin: lastSignin,
        };

        firebaseInstance.analytics().logEvent("firebase_auth", { userData: userData})

        ReactGA.event({
          category: 'Sign-up',
          action: 'sign_up',
          label: 'example label',
        })
        this.props.setUserData(userData);
        this.props.saveUserData(userData, this.props.history);
      }

      //this.props.history.push("/dashboard/profile");
    });
  }

  // Make sure we un-register Firebase observers when the component unmounts.
  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  render() {
    const { classes } = this.props;

    return (
      <Container
        maxWidth="md"
        className={classes.root}
        style={{padding: this.props.history ? '50px 40px 75px' : 0, background: this.props.history ? '#f5f5f5' : '#ffffff'}}
      >
        <Grid container direction="row" justify="center" alignItems="center">
          {this.props.history &&
            <>
              <Grid item xs={12} sm={6}>
                <p className={classes.title}>You need to sign in or create an account to continue</p>
              </Grid>
            </>
          }
          <Grid item xs={12} sm={this.props.history ? 6 : 12}>
            <StyledFirebaseAuth
              uiConfig={uiConfig}
              firebaseAuth={firebase.auth()}
            />
          </Grid>
        </Grid>

        <div className={classes.footer}>
          <p
            style={{
              padding: this.props.history ? '20px 20px 0': '20px 0 0',
              lineHeight: this.props.history ? '29px' : '18px',
              fontSize: this.props.history ? 16 : 13
            }}
          >
            By continuing with this purchasing process you indicate that you have read and agree with our <a href="#">Privacy Policy</a> and <a href="#">Terms & Conditions.</a>
          </p>
        </div>
      </Container>
    );
  }
}
FirebaseUI.propTypes = {
  user: PropTypes.object.isRequired,
  setUserData: PropTypes.func.isRequired,
  saveUserData: PropTypes.func.isRequired,
};

const mapActionsToProps = {
  setUserData,
  saveUserData,
};

const mapStateToProps = (state) => ({
  user: state.user,
  data: state.data,
});

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(FirebaseUI));
