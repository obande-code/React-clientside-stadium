import React from "react";
import firebase from "firebase/app";
import { GeoFire } from "geofire";
import { Drawer, Tabs, Tab, withStyles } from "@material-ui/core";
import Rating from "@material-ui/lab/Rating";
import Moment from "moment";
import { extendMoment } from "moment-range";
import DirectionsWalkIcon from "@material-ui/icons/DirectionsWalk";
import Button from "@material-ui/core/Button";

import Map from "../Map/Map";
import ListingsContainer from "../Map/ListingsContainer";


import { SpaceAvailabilityCheck } from "../../util/SpaceAvailabilityCheck";
import { CheckIfAlreadyReserved } from "../../util/CheckIfAlreadyReserved";

import { listingExplorerStyles } from "./styles";

import {loadScript} from "../../util/googleMapFunctions";

const moment = extendMoment(Moment);

const API_KEY = process.env.REACT_APP_API_KEY;

class ListingExplorer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			listings: [],
			realListings: [],
			chosenLocation: props.chosenLocation,
			timeDelta: props.timeDelta,
			startDate: props.startDate,
			endDate: props.endDate,
			tabValue: 0,
			selectedSpot: {},
			confirmation: false,
		};
		this.listingsContainerRef = React.createRef();
	}

	changeTime = (start, end) => {
		/* this.setState({
      listings: [],
      startDate: start,
      endDate: end,
      timeDelta: end - start,
    });*/

		this.getListings(0);
		this.render();
	};

	componentDidUpdate(prevProps, prevState) {
		if (this.state.listings !== prevState.listings || this.props.listings !== prevProps.listings) {
			this.showProperSpots(this.state.listings);

		}

		if (this.state.chosenLocation !== prevState.chosenLocation) {
			this.getListings(0);
		}

		if(this.props.chosenLocation !== prevProps.chosenLocation) {
			this.setState({
				chosenLocation: this.props.chosenLocation
			})
		}
	}

	async getListings(n) {
		// TO DO
		// make it so it pulls 10 listings at a time, starting at n*10
		// having a page feature, where you click next, get 10
		// to save $$$ on firebase pulls
		let database = firebase.database();
		let upcoming = [];
		var storage = firebase.storage();

		//ref to 'Upcoming_bookings' in firebase
		let dbRef = firebase.database().ref("Upcoming_Bookings");

		//Firebase ref to 'spots' location
		let spotRef = database.ref("Spots");

		//Geofire ref for location query
		let geoFire = new GeoFire(spotRef);

		//Coordinates from user's search locations
		let lat = this.state.chosenLocation.lat;
		let lng = this.state.chosenLocation.lng;
		let coords = [lat, lng];

		//Stores keys of spots within the search radius
		let spotKeys = [];

		// Create a GeoQuery centered at search location with radius = 40km
		let geoQuery = await geoFire.query({
			center: coords,
			radius: 5,
		});

		//Used to compare user's time range with each spot's availability to only display spots that are available during that time
		let startDate = this.props.startDate;
		let endDate = this.props.endDate;

		//For every spot in the query the spotId is pushed to spotKeys[] and prints info for testing purposes
		let onKeyEnteredRegistration = geoQuery.on(
			"key_entered",
			function (key, location, distance) {
				spotKeys.push(key);
			}
		);

		//Stores listing information for spaces within the query
		let listings = [];

		this.state.listings = [];

		//Retrieves spots from firebase and adds them to the listings[] if their spotId is in spotKeys[]
		let dataSnapshot = database.ref("Spots");
		await dataSnapshot.once("value").then((parent) => {
			if (!parent.exists()) {
				this.setState({
					listings: [],
					realListings: [],
				});
			} else {
				parent.forEach((child) => {
					let childData = child.val();
					if (spotKeys.includes(child.key)) {
						let available =
							SpaceAvailabilityCheck(
								child
									.child(
										"availability"
									)
									.val(),
								startDate,
								endDate
							);
						let reserved = false;
						let isActive = childData["is_active"]
						var verified =
							childData[
								"address_is_verified"
							];
						let prices =
							childData["prices"];

						let days = this.props.timeDelta / 1000 / 60 / 60 / 24;

						if (days >= 30) {
							if (prices["monthly"] === 0) {
								verified = false;
							}
						} else if (days >= 7) {
							if (prices["weekly"] === 0) {
								verified = false;
							}
						} else {
							if (prices["hourly"] === 0) {
								verified = false;
							}
						}


						//Calculating price
						if (days <= 1) {
							let hours = this.props.timeDelta / 1000 / 60 / 60;
							let price = hours * prices["hourly"];
							if (price > prices["daily_max"] && prices["daily_max"] !== 0) {
								childData["bookingPrice"] = prices["daily_max"];
							} else {
								childData["bookingPrice"] = price;
							}
						} else if (days < 7) {
							childData["bookingPrice"] = days * prices['daily_max'];
						} else if (days < 30) {
							let weekly = Math.floor(days / 7.0);
							let weeklyRemainder = days % 7;

							let daily = Math.floor(weeklyRemainder);

							childData["bookingPrice"] = (
								weekly * prices['weekly'] +
								daily * prices['daily_max']
							);
						} else {
							childData["bookingPrice"] = (days / 30.0) * prices['monthly'];
						}

						let walkTime;


						//Calculating walking distance and time
						const google = window.google;

                        const service = new google.maps.DistanceMatrixService();
                          service.getDistanceMatrix(
                            {
                                origins: [`${this.state.chosenLocation.lat},${this.state.chosenLocation.lng}`],
                                destinations: [`${childData.l[0]},${childData.l[1]}`],
                                travelMode: 'WALKING',
                            }).then((distances) => {

                                if (distances) {
                                    walkTime = distances.rows[0].elements[0].duration.text
                                    let walkDistance = distances.rows[0].elements[0].duration.value
                                    childData["walkTime"] = walkTime
                                    childData["walkDistance"] = walkDistance;

									this.setState({
										hasDistance: true,
									});
                                }
                            });


						const imageRef = storage.ref(
							`listingImages/${childData["owners_uid"]}/${childData["spotId"]}/image1`
						);

						imageRef.getDownloadURL()
							.then((url) => {
								childData[
									"image"
								] = url;

								this.setState({
									hasImage: true,
								});
							})
							.catch((error) => {
								// A full list of error codes is available at
								// https://firebase.google.com/docs/storage/web/handle-errors
								switch (
									error.code
								) {
									case "storage/object-not-found":
										// File doesn't exist
										break;
									case "storage/unauthorized":
										// User doesn't have permission to access the object
										break;
									case "storage/canceled":
										// User canceled the upload
										break;

									// ...

									case "storage/unknown":
										// Unknown error occurred, inspect the server response
										break;
									default:
										break;
								}
							});

						if (
							available === true &&
							verified === true &&
							reserved === false &&
							isActive === true
						) {
							listings.push(
								childData
							);
						}
					}
				});
				this.setState({
					listings: listings,
				});
			}
		});

		/*try {
      await this.showProperSpots(listings)
    }
    catch(err){
      console.log(err)
      this.setState({
        listings: listings,
      });
    }*/
	}

	//Need to fix this to make it async with getListings()
	async showProperSpots(listings) {
		let startDate = this.props.startDate;
		let endDate = this.props.endDate;
		let dbRef = firebase.database().ref("Upcoming_Bookings");
		let realListings = [];

		if (listings.length) {
			console.log(listings.length);
			loopSpots: for (let i = 0; i < listings.length; i++) {

				dbRef.child(listings[i].spotId).on(
					"value",
					(snapshot) => {
						if (snapshot.exists()) {
							console.log(`children: ${snapshot.numChildren()}, spaces: ${listings[i].number_of_spaces}`)
							let checkTimes = true
							if(snapshot.numChildren() < listings[i].number_of_spaces && listings[i].number_of_spaces > 1) {
								realListings.push(
									listings[i]
								);
								checkTimes = false
							} else {
								checkTimes = false
							}
							if (checkTimes == true) {
								snapshot.forEach(
									(child) => {
										let bookingStart =
											new Date(
												child
													.child(
														"startTime"
													)
													.val()
											);
										let bookingEnd =
											new Date(
												child
													.child(
														"endTime"
													)
													.val()
											);
										let range =
											moment.range(
												bookingStart,
												bookingEnd
											);

										if (
											range.contains(
												startDate
											) ||
											range.contains(
												endDate
											)
										) {
											//reserved = true;
											return true;
										} else {
											realListings.push(
												listings[
													i
													]
											);
											//reserved = false;
										}
									}
								);
							}
						} else {
							realListings.push(
								listings[i]
							);
							//reserved = false;
						}
						let uniqueListings = [...new Set(realListings)]
						this.setState({
							realListings:
							uniqueListings,
						});

					}
				);
			}
			}
		else
			{
				let uniqueListings = [...new Set(realListings)]
				this.setState({
					realListings: uniqueListings,
				});
			}
	}

	componentDidMount() {
		// this is a react thing that runs before component is rendered
		// that way it pulls the data first and then renders
		this.getListings(0);
	}

	handleClickMapPin(spot) {
		this.setState({
			selectedSpot: spot,
		});
		this.listingsContainerRef.current.callActiveConfirmationPrompt(
			spot
		);
	}

	showSelectedSpot() {
		this.setState({
			confirmation: true,
		});
	}

	cancelCallback() {
		this.setState({
			selectedSpot: {},
			confirmation: false,
		});
	}

	handleMapResearch(center) {
		this.setState({
			chosenLocation: center
		})
	}

	handleActiveConfirmation() {
		this.setState({
			confirmation: true,
		});
	}

	getRatingNumber(chosenSpot) {
		var c = chosenSpot.reviews_ratings;
		var count = 0;
		for (var i in c) {
			if (c.hasOwnProperty(i)) count++;
		}

		return count;
	}

	getRatingAverage(chosenSpot) {
		var c = chosenSpot.reviews_ratings;
		var count = 0;
		var average = 0;
		for (var i in c) {
			if (c.hasOwnProperty(i)) {
				count++;
				average = average + c[i].rating;
			}
		}

		return average / count;
	}



	render() {
		/* if (this.state.listings.length === 0) {
      return null;
    }*/
		const { tabValue, selectedSpot, confirmation } = this.state;
		const { classes } = this.props;

		let cheapestListings;
		let closestListings;

		if (this.state.realListings.length > 1) {
			cheapestListings = [...this.state.realListings].sort(
				(a, b) =>
					a.prices["hourly"] - b.prices["hourly"]
			);
			closestListings = [...this.state.realListings].sort(
				(a, b) =>
					a["walkDistance"] - b["walkDistance"]
			);
		} else {
			cheapestListings = [...this.state.listings];
			closestListings = [...this.state.listings]
		}

		const handleTabsChange = (event, newValue) => {
			this.setState({ tabValue: newValue });
		};

		return (
			<>
				<Drawer
					className={
						!confirmation
							? classes.listings
							: classes.activeListings
					}
					variant='persistent'
					anchor='left'
					open
					classes={{
						paper: classes.listingsPaper,
					}}
				>
					<Tabs
						value={tabValue}
						onChange={handleTabsChange}
						variant='fullWidth'
						indicatorColor='primary'
						aria-label='BEST MATCH'
						className={classes.tabs}
					>
						<Tab
							label='BEST MATCH'
							{...a11yProps(0)}
							className={classes.tab}
						/>
						<Tab
							label='CHEAPEST'
							{...a11yProps(1)}
							className={classes.tab}
						/>
						{<Tab label="CLOSEST" {...a11yProps(2)} className={classes.tab} />}
					</Tabs>
					<TabPanel value={tabValue} index={0}>
						<ListingsContainer
							ref={
								this
									.listingsContainerRef
							}
							listings={
								this.state
									.realListings
							}
							timeDelta={
								this.props
									.timeDelta
							}
							startDate={
								this.props
									.startDate
							}
							endDate={
								this.props
									.endDate
							}
							chosenLocation={
								this.state
									.chosenLocation
							}
							activeConfirmation={() =>
								this.handleActiveConfirmation()
							}
							cancelConfirmation={() =>
								this.cancelCallback()
							}
						/>
					</TabPanel>
					<TabPanel value={tabValue} index={1}>
						<ListingsContainer
							ref={
								this
									.listingsContainerRef
							}
							listings={
								cheapestListings
							}
							timeDelta={
								this.props
									.timeDelta
							}
							startDate={
								this.props
									.startDate
							}
							endDate={
								this.props
									.endDate
							}
							chosenLocation={
								this.state
									.chosenLocation
							}
							activeConfirmation={() =>
								this.handleActiveConfirmation()
							}
							cancelConfirmation={() =>
								this.cancelCallback()
							}
						/>
					</TabPanel>
					<TabPanel value={tabValue} index={2}>
						<ListingsContainer
							ref={
								this
									.listingsContainerRef
							}
							listings={
								closestListings
							}
							timeDelta={
								this.props
									.timeDelta
							}
							startDate={
								this.props
									.startDate
							}
							endDate={
								this.props
									.endDate
							}
							chosenLocation={
								this.state
									.chosenLocation
							}
							activeConfirmation={() =>
								this.handleActiveConfirmation()
							}
							cancelConfirmation={() =>
								this.cancelCallback()
							}
						/>
					</TabPanel>
				</Drawer>

				{Object.keys(selectedSpot).length > 0 && (
					<div
						className={classes.spotData}
						onClick={() =>
							this.showSelectedSpot()
						}
					>
						<div
							className={
								classes.spotName
							}
						>
							<span>
								{
									selectedSpot.spot_name
								}
							</span>
							{" on "}
							<span>
								{
									selectedSpot.city
								}{" "}
								{
									selectedSpot.state
								}
								{", "}
								{
									selectedSpot.postal_code
								}
							</span>
						</div>
						<div
							className={
								classes.spotRating
							}
						>
							<Rating
								value={
									this.getRatingAverage(
										selectedSpot
									) || 5
								}
								size='small'
								readOnly
							/>
							<p>
								(
								{this.getRatingNumber(
									selectedSpot
								)}
								)
							</p>
						</div>
						<div
							className={
								classes.minutes
							}
						>
							<DirectionsWalkIcon
								className={
									classes.workIcon
								}
							/>
							{selectedSpot.walkTime}
							<span>
								&nbsp;
								{"RESERVABLE"}
							</span>
						</div>
						<Button
							variant='contained'
							className={
								classes.selectButton
							}
						>
							View details & reserve
						</Button>
					</div>
				)}

				<Map
					chosenLocation={
						this.state.chosenLocation
					}
					listings={this.state.realListings}
					timeDelta={this.props.timeDelta}
					onClickMapPin={(spot) =>
						this.handleClickMapPin(spot)
					}
					/*handleMapResearch={(center) =>
						this.handleMapResearch(center)
					}*/
				/>
			</>
		);
	}
}

function a11yProps(index) {
	return {
		id: `listings-tab-${index}`,
		"aria-controls": `listings-tabpanel-${index}`,
	};
}

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role='tabpanel'
			hidden={value !== index}
			id={`listings-tabpanel-${index}`}
			aria-labelledby={`listings-tab-${index}`}
			{...other}
		>
			{value === index && children}
		</div>
	);
}

export default withStyles(listingExplorerStyles)(ListingExplorer);
