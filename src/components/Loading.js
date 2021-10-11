import React from "react";
import {connect} from "react-redux";
import {Backdrop, CircularProgress, withStyles} from "@material-ui/core";
import PropTypes from "prop-types";

const styles = (theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    background: 'transparent',
    color: '#0f7277',
  },
});

class Loading extends React.Component {
  // eslint-disable-next-line no-useless-constructor
  constructor(props) {
    super(props);
  }

  render() {
    const { classes, user } = this.props;

    return (
      <Backdrop className={classes.backdrop} open={user.loading}>
        <CircularProgress color="inherit"/>
      </Backdrop>
    )
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

Loading.propTypes = {
  user: PropTypes.object.isRequired,
};

export default connect(
  mapStateToProps
)(withStyles(styles)(Loading));
