import React, { Component } from "react";

import { Grid, Button, Paper, withStyles } from "@material-ui/core";
import SearchBar from "../components/Map/Search bar/SearchBar";
import ListingExplorer from "../components/Map/ListingExplorer";
import CalendarSelector from "../components/Map/Search bar/CalendarSelector";
import Moment from "moment";
import "../home.css";
import { TextField } from "@material-ui/core";
import { initMap } from "../util/googleMapFunctions";

const currentDate = Moment(new Date()).format("YYYY-MM-DDTHH:mm");

const styles = (theme) => ({
	label: {
		textTransform: "uppercase",
		fontSize: 12,
		fontWeight: 500,
		color: "rgba(0, 0, 0, .54)",
		lineHeight: 1,
	},
	paperContainer: {
		padding: "0 10px",
		boxShadow: "2px 2px 10px 0 rgb(0 0 0 / 4%)",
		position: "absolute",
		width: "calc(100% - 20px)",
		zIndex: 2,
	},
	searchContainer: {
		display: "flex",
		alignItems: "stretch",
		justifyContent: "center",
		padding: "12px 0 12px",
		[theme.breakpoints.down("sm")]: {
			backgroundColor: "#fff",
			margin: "0 2%",
			flexDirection: "column",
			position: "fixed",
			zIndex: 1,
			top: 80,
			left: 0,
			width: "96%",
			padding: 0,
			borderRadius: 4,
			boxShadow: "0 1px 4px 0 hsl(0deg 0% 59% / 17%)",
			border: "1px solid #e3e3e3",
		},
	},
	dateContainer: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 12,
		marginRight: 12,
		[theme.breakpoints.down("sm")]: {
			margin: "12px 0 0",
		},
	},
	arrivingOn: {
		marginRight: 12,
		[theme.breakpoints.down("sm")]: {
			marginRight: 0,
			"& label": {
				transform: "translate(14px, 0px) scale(0.75) !important",
			},
			"& fieldset": {
				borderColor: "transparent !important",
			},
		},
	},
	leavingOn: {
		[theme.breakpoints.down("sm")]: {
			"& label": {
				transform: "translate(14px, 0px) scale(0.75) !important",
			},
			"& fieldset": {
				borderColor: "transparent !important",
			},
		},
	},
	sep: {
		display: "none",
		height: 40,
		width: 40,
		margin: "-20px 2% 0",
		background: "url(https://static.justpark.com/web/assets/arrow_right_short.dc2fef277bd6adc401b9007b9765d345.svg) 50% no-repeat",
		[theme.breakpoints.down("sm")]: {
			display: "block",
		},
	},
	searchButton: {
		paddingTop: 14,
		paddingBottom: 14,
		width: 120,
		backgroundColor: "#0f7277",
		[theme.breakpoints.down("sm")]: {
			display: "none",
		},
	},
});

class mapPage extends Component {
	constructor(props) {
		super(props);

		const queryParams = new URLSearchParams(window.location.search);

		const address = queryParams.get("address");
		const lat = Number(queryParams.get("lat"));
		const lng = Number(queryParams.get("lng"));
		const place_id = queryParams.get("place_id");
		let arriving = new Date(queryParams.get("arriving"));
		let leaving = new Date(queryParams.get("leaving"));

		if(queryParams.get("arriving") == null) {
			arriving = new Date()
			arriving.setTime(arriving.getTime() + (10*60*1000))
		}

		if(queryParams.get("leaving") == null) {
			leaving = new Date()
			leaving.setTime(leaving.getTime() + (2*65*60*1000))
		}

		console.log(queryParams.get("arriving"))
		console.log(arriving)
		console.log(leaving)

		let location = {
			address: address,
			lat: lat,
			lng: lng,
			place_id: place_id,
		};

		this.state = {
			locationSelected: location,
			startDate: arriving,
			endDate: leaving,
			datesValid: true,
		};
		this.listingExplorerComponent = React.createRef();
		//this.state = this.props.location.state;
		this.userLocationInputCallback =
			this.userLocationInputCallback.bind(this);
		this.userDateSelectionCallback =
			this.userDateSelectionCallback.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		// Typical usage (don't forget to compare props):

		if (this.state.endDate !== prevState.endDate) {
			this.renderDateTimePicker();
		}
	}

	handleClick = () => {
		this.listingExplorerComponent.current.changeTime(
			this.state.startDate,
			this.state.endDate
		);
	};

	userDateSelectionCallback = (event) => {
		let date = new Date(event.target.value);
		this.setState(
			{
				[event.target.name]: date,
			},
			() => {
				this.checkDatesValidity();
			}
		);
	};

	checkDatesValidity() {
		let { startDate, endDate } = this.state;
		// makes sure both are not null
		if (startDate && endDate) {
			if (!(startDate > 0 && endDate > 0)) {
				// if startDate and endDate is invalid timestamp
				alert(
					"Selected dates are invalid. Please select new dates"
				);
				//this.setState({ datesValid: false });
				return false;
			} else if (startDate >= endDate) {
				// if end date is before start date, not valid


				endDate.setTime(startDate.getTime() + (2*60*60*1000))
				this.setState({ datesValid: true,
						endDate: endDate});
				this.listingExplorerComponent.current.changeTime(
					startDate,
					endDate
				);
				this.renderDateTimePicker()
				return true;
			} else if (startDate.getTime() < Date.now()) {
				/*alert(
					"Selected dates are invalid. Please select new dates"
				);

				startDate.setTime(Date.now() + (15*60*1000))*/

				this.setState({ datesValid: true,
					startDate: startDate});
				this.listingExplorerComponent.current.changeTime(
					startDate,
					endDate
				);
				this.renderDateTimePicker()

				//this.setState({ datesValid: false });
				return true;
			} else {
				// valid, sets datesValid to true, otherwise map doesn't initially load
				this.setState({ datesValid: true });
				this.listingExplorerComponent.current.changeTime(
					startDate,
					endDate
				);
				return true;
			}
		} else {
			// if startDate || endDate == null, user hasn't picked anything yet
			return false;
		}
	}

	// sends request to google places details api in order to turn
	// place id from user selection into gps location for the map
	userLocationInputCallback(location) {
		// axios
		//   .get("/maps/api/place/details/json?", {
		//     params: {
		//       place_id: location.placeId,
		//       key: API_KEY,
		//       language: "en",
		//     },
		//   })
		//   .then((response) => {
		//     let lat = response.data.result.geometry.location.lat;
		//     let lng = response.data.result.geometry.location.lng;
		//     this.setState({
		//       locationSelected: {
		//         lat: lat,
		//         lng: lng,
		//         address: location.name,
		//         placeId: location.placeId,
		//       },
		//     });
		//     this.listingExplorerComponent.current.changeTime(
		//       this.state.startDate,
		//       this.state.endDate
		//     );
		//   })
		//   .catch((err) => {
		//     console.log(`error getting place details: ${err}`);
		//   });
		const { service, request } = initMap(location.placeId);

		service.getDetails(request, (place, status) => {
			if (place) {
				const { geometry } = place;
				let lat = geometry.location.lat();
				let lng = geometry.location.lng();
				this.setState({
					locationSelected: {
						lat: lat,
						lng: lng,
						address: location.name,
						placeId: location.placeId,
					},
				});
				this.listingExplorerComponent.current.changeTime(
					this.state.startDate,
					this.state.endDate
				);

				let address =
					this.state.locationSelected.address;
				let id = this.state.locationSelected.placeId;
				this.props.history.push({
					pathname: "/search",
					//search: `?lat=${lat}&long=${long}&place_id=${id}&arriving=${this.state.startDate}&leaving=${this.state.endDate}`,
					search: `?lat=${lat}&lng=${lng}&place_id=${id}&address=${address}&arriving=${this.state.startDate}&leaving=${this.state.endDate}`,
					state: {
						locationSelected:
							this.state
								.locationSelected,
						startDate: this.state.startDate,
						endDate: this.state.endDate,
						datesValid: this.state
							.datesValid,
					},
				});
			}
		});
	}

	renderSearchBar() {
		return (
			<div
				id='search_bar_container'
				style={{ marginTop: "100px" }}
			>
				<SearchBar
					parentCallback={(location) => {
						this.userLocationInputCallback(
							location
						);
					}}
				/>
			</div>
		);
	}

	//renderDateTimePicker(address) {
	renderDateTimePickerOld(address) {
		const { classes } = this.props;

		return (
			<Grid container spacing={3}>
				<Grid item xs={12}>
					<SearchBar
						value={address}
						parentCallback={(location) => {
							this.userLocationInputCallback(
								location
							);
						}}
					/>
				</Grid>
				<Grid item xs={6}>
					<Paper>
						<TextField
							id='Start'
							name='startDate'
							label='Arriving On'
							type='datetime-local'
							fullWidth={true}
							defaultValue={
								currentDate
							}
							onChange={
								this
									.userDateSelectionCallback
							}
							InputLabelProps={{
								shrink: true,
							}}
							InputProps={{
								style: {
									fontWeight: "700",
								},
							}}
						/>
					</Paper>
				</Grid>
				<Grid item xs={6}>
					<Paper>
						<label
							className={
								classes.label
							}
						>
							End:{" "}
						</label>
						<CalendarSelector
							start={false}
							parentCallback={(
								date,
								start
							) => {
								this.userDateSelectionCallback(
									date,
									start
								);
							}}
							selectedTime={
								this.state
									.endDate
							}
						/>
					</Paper>
				</Grid>
				<Button onClick={this.handleClick}>
					button
				</Button>
			</Grid>
		);
	}

	renderDateTimePicker() {
		const { classes } = this.props;

		let startDate = Moment(new Date(this.state.startDate)).format(
			"YYYY-MM-DDTHH:mm"
		);
		let endDate = Moment(new Date(this.state.endDate)).format(
			"YYYY-MM-DDTHH:mm"
		);

		return (
			<Paper className={classes.paperContainer}>
				<div className={classes.searchContainer}>
					<SearchBar
						value={
							this.state
								.locationSelected
								.address
						}
						parentCallback={(location) => {
							this.userLocationInputCallback(
								location
							);
						}}
						search={true}
					/>

					<form className={classes.dateContainer}>
						<TextField
							id='Start'
							variant='outlined'
							name='startDate'
							label='Arriving On'
							type='datetime-local'
							fullWidth={true}
							defaultValue={startDate}
							onChange={
								this
									.userDateSelectionCallback
							}
							InputLabelProps={{
								shrink: true,
							}}
							InputProps={{
								style: {
									fontWeight: "700",
								},
							}}
							className={
								classes.arrivingOn
							}
						/>
						<div className={classes.sep} />
						<TextField
							id='End'
							variant='outlined'
							name='endDate'
							label='Leaving On'
							type='datetime-local'
							fullWidth={true}
							defaultValue={endDate}
							onChange={
								this
									.userDateSelectionCallback
							}
							InputLabelProps={{
								shrink: true,
							}}
							InputProps={{
								style: {
									fontWeight: "700",
								},
							}}
							className={
								classes.leavingOn
							}
						/>
					</form>

					<Button
						variant='contained'
						color='primary'
						fullWidth={true}
						size='large'
						className={classes.searchButton}
						onClick={this.handleClick}
					>
						Search
					</Button>
				</div>
			</Paper>
		);
	}

	// the render after user has initially selected a location
	mainRender() {
		return (
			<>
				{this.renderDateTimePicker()}
				<ListingExplorer
					ref={this.listingExplorerComponent}
					chosenLocation={
						this.state.locationSelected
					}
					timeDelta={
						this.state.endDate -
						this.state.startDate
					}
					startDate={this.state.startDate}
					endDate={this.state.endDate}
				/>
			</>
		);
	}

	render() {
		// if (!this.state.locationSelected) {
		// comment next line and uncomment ^ so it starts without valid date for testing

		if (!this.state.locationSelected || !this.state.datesValid) {
			return this.renderDateTimePicker();
		} else {
			return this.mainRender();
		}
	}
}

export default withStyles(styles)(mapPage);
