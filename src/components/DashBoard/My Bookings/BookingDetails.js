import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { isIOS } from "react-device-detect";
import CustomText from "../../Atom/CustomText";
import BookingItemTime from "./BookingItemTime";

class BookingDetails extends Component {
  state = {
    data: [],
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

  render() {
    return (
      <div style={{position: 'relative'}}>
        <CustomText type="title" title={this.props.address} />
        
        <CustomText type="description" title={'Booking Ref:' + this.props.bookingKey} />
        <br></br>
        {!this.props.user_reviewed ? (
          <Typography variant="h7">lll</Typography>
        ) : (
          <Typography variant="h7">You rated: {this.props.rating}</Typography>
        )}
        <br /> <br />

        <BookingItemTime
          from={this.props.startTime}
          to={this.props.endTime}
        />

        <br />
        {!isIOS ? (
          <Button
            type="button"
            color='primary'
            fullWidth
            variant='contained'
            onClick={(e) => {
              e.preventDefault();
              window.location.href =
                `http://maps.google.com/maps?saddr=My+Location&daddr=${this.props.lat},${this.props.long}`;
            }}
          >
            {" "}
            Get Directions
          </Button>
        ) : (
          <Button
            type="button"
            color='primary'
            fullWidth
            variant='contained'
            onClick={(e) => {
              e.preventDefault();
              window.location.href =
                `http://maps.apple.com/?saddr=Current&daddr=${this.props.lat},${this.props.long}&amp;ll=`;
            }}
          >
            {" "}
            Get Directions
          </Button>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  data: state.data,
});

BookingDetails.propTypes = {
  data: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(BookingDetails);
