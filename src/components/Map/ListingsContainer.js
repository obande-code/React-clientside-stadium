import React from "react";
import { Grid, Paper, withStyles } from "@material-ui/core";
import DirectionsWalkIcon from "@material-ui/icons/DirectionsWalk";
import Rating from "@material-ui/lab/Rating";
import Image from "material-ui-image";

import ConfirmationPrompt from "../Map/ConfirmationPrompt";
import firebase from "../../util/firebase";

const styles = (theme) => ({
	listingItem: {
		// width: "100%",
		height: 128,
		margin: theme.spacing(1.5),
		marginBottom: 0,
		cursor: "pointer",
		boxShadow: "0 3px 4px 0 hsl(0deg 0% 59% / 30%)",
		"&:hover": {
			transform: "scale(1.029) !important",
		},
	},
	listingsContainer: {
		position: "absolute",
		width: "100%",
		height: "calc(100% - 205px)",
		background: "#efefef",
	},
});

class ListingsContainer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			listings: [],
			timeDelta: this.props.timeDelta,
			hourlyPrice: false,
			dailyPrice: false,
			monthlyPrice: false,
			weeklyPrice: false,
			showConfirmationPrompt: false,
			chosenSpot: null,
			startDate: this.props.startDate,
			endDate: this.props.endDate,
			chosenLocation: this.props.chosenLocation,
			imageURL: "",
			imageLoaded: false,
		};

		this.cancelCallback = this.cancelCallback.bind(this);
	}

	cancelCallback() {
		this.setState({
			showConfirmationPrompt: false,
			choseSpot: null,
		});
		this.props.cancelConfirmation();
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

	componentDidMount() {
		this.setTimeDeltaVariables();

		/*this.setState({
			listings: this.props.listings,
		});*/
	}

	//shouldComponentUpdate(nextProps)

	componentDidUpdate(prevProps, prevState) {
		if (this.props.listings !== prevProps.listings || this.state.listings !== this.props.listings) {
			this.setState({
				listings: this.props.listings,
				//showConfirmationPrompt: false
			})
			this.render();
		}
		if(this.props.startDate !== prevProps.startDate || this.props.endDate !== prevProps.endDate) {
			this.setState({
				showConfirmationPrompt: false
			})
		}
	}

	activateConfirmationPrompt(spotId, chosenSpot, price) {
		this.setState({
			showConfirmationPrompt: true,
			chosenSpot: spotId,
			price: price,
			spot: chosenSpot,
			ratingAverage: this.getRatingAverage(chosenSpot),
			ratingNumber: this.getRatingNumber(chosenSpot),
		});
	}

	setTimeDeltaVariables() {
		let days = this.props.timeDelta / 1000 / 60 / 60 / 24;
		let [hourlyPrice, weeklyPrice, monthlyPrice, dailyPrice] = [
			false,
			false,
			false,
			false,
		];
		if (days > 30) {
			monthlyPrice = true;
		} else if (days > 14) {
			weeklyPrice = true;
		} else if (days > 2) {
			dailyPrice = true;
		} else {
			hourlyPrice = true;
		}

		this.setState(
			{
				hourlyPrice: hourlyPrice,
				monthlyPrice: monthlyPrice,
				weeklyPrice: weeklyPrice,
				dailyPrice: dailyPrice,
			},
			() => {}
		);
	}

	callActiveConfirmationPrompt(spot) {
		this.activateConfirmationPrompt(
			spot.spotId,
			spot,
			spot.bookingPrice
		);
	}

	mouseHover(listing) {
		let mapPinElement = document.getElementById(
			`mapPin${listing.spotId}`
		);
		if (mapPinElement) {
			mapPinElement.classList.add("active");
		}
	}

	mouseLeave(listing) {
		let mapPinElement = document.getElementById(
			`mapPin${listing.spotId}`
		);
		if (mapPinElement) {
			mapPinElement.classList.remove("active");
		}
	}

	renderListing(listing) {
		const { classes } = this.props;




		return (
			<Paper
				key={listing.spotId}
				id={`spotListing${listing.spotId}`}
				className={classes.listingItem}
				onClick={() => {
					this.props.activeConfirmation();
					this.activateConfirmationPrompt(
						listing.spotId,
						listing,
						listing.bookingPrice
					);
				}}
				onMouseEnter={() => this.mouseHover(listing)}
				onMouseLeave={() => this.mouseLeave(listing)}
			>
				<Grid container>
					<Grid item xs={4}>
						<Image
							src={listing.image}
							imageStyle={{
								width: 128,
								height: 128,
							}}
							alt='parking location'
						></Image>
					</Grid>
					<Grid item xs={8}>
						<div
							style={{
								padding: "16px 12px",
								fontSize: "12px",
								height: "calc(100% - 32px)",
								display: "flex",
								flexDirection:
									"column",
								justifyContent:
									"space-between",
							}}
						>
							<div>
								<span
									style={{
										textTransform:
											"capitalize",
										color: "#3e3e3e",
										fontWeight: 700,
									}}
								>
									{
										listing.spot_name
									}
								</span>
								<span
									style={{
										color: "#999",
										fontWeight: 400,
									}}
								>
									{" "}
									on{" "}
									{
										listing.street_name
									}
								</span>
							</div>
							<div
								style={{
									display: "flex",
									alignItems: "center",
								}}
							>
								<Rating
									value={
										this.getRatingAverage(
											listing
										) ||
										5
									}
									size='small'
									readOnly
								/>
								<span>
									(
									{this.getRatingNumber(
										listing
									)}
									)
								</span>
							</div>
							<div
								style={{
									display: "flex",
									alignItems: "flex-end",
								}}
							>
								<div
									style={{
										flex: "1 0 50%",
										fontSize: "1.25rem",
										fontWeight: 700,
										color: "#293038",
									}}
								>
									$
									{this
										.state
										.hourlyPrice && (
										<>
											{
												Number.parseFloat(
														listing.bookingPrice
												)
													.toFixed(
														2
													)
													.toString()
													.split(
														"."
													)[0]
											}

											.
											<span
												style={{
													fontSize: "0.7rem",
												}}
											>
												{
													Number.parseFloat(
														listing.bookingPrice
													)
														.toFixed(
															2
														)
														.toString()
														.split(
															"."
														)[1]
												}
											</span>
										</>
									)}
									{this
										.state
										.weeklyPrice &&
										listing
											.prices
											.weekly}
									{this
										.state
										.dailyPrice &&
										listing
											.prices
											.daily_max}
									<p
										style={{
											fontSize: 12,
											fontWeight: 400,
											color: "#999",
											margin: "0 0 0 2px",
										}}
									>
										total
										price
									</p>
								</div>
								{
									<div
                  style={{
                    flex: "1 0 50%",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#293038",
                  }}
                >
                  <DirectionsWalkIcon
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                    }}
                  />{" "}
                  <span>{listing.walkTime ? listing.walkTime.slice(0,7) : " "}</span>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 400,
                      color: "#999",
                      margin: "0 0 0 8px",
                    }}
                  >
                    to destination
                  </p>
                  </div>}
								{/* <Button
                  variant="contained"
                  color="primary"
                  style={{ width: "100%" }}
                  onClick={() => {
                    this.activateConfirmationPrompt(
                      listing.spotId,
                      listing,
                      this.getPrice(listing)
                    );
                  }}
                >
                  Reserve
                </Button> */}
							</div>
						</div>
					</Grid>
				</Grid>
				{/* <Grid
          container
          style={{
            marginTop: "1.5%",
          }}
        >
          <Grid item xs={12}>
            <p
              style={{
                textAlign: "center",
                fontWeight: "bold",
                borderBottom: "1px solid",
              }}
            >
              {listing.spot_name}
            </p>
          </Grid>
          <Grid item xs={12} style={{ textAlign: "center" }}>
            {listing.street_number} {listing.street_name} {listing.state}
          </Grid>
          <Grid item>
            <img
              id={listing.spotId}
              alt="complex"
              style={{ width: 128, height: 128 }}
            />
          </Grid>
          <Grid item xs={12} style={{ textAlign: "center" }}>
            ${Number.parseFloat(this.getPrice(listing)).toPrecision(4)}
          </Grid>

          <Button
            variant="contained"
            color="primary"
            style={{ width: "100%" }}
            onClick={() => {
              this.activateConfirmationPrompt(
                listing.spotId,
                listing,
                this.getPrice(listing)
              );
            }}
          >
            Reserve
          </Button>
        </Grid> */}
			</Paper>
		);
	}

	render() {
		const { classes } = this.props;
		let renderedListings = [];

		if (this.props.listings) {
			for (const listing of this.props.listings) {
				renderedListings.push(
					this.renderListing(listing)
				);
			}
		}

		return (
			<div
				id='listingsContainer'
				className={classes.listingsContainer}
			>
				{!this.state.showConfirmationPrompt &&
					renderedListings}
				{this.state.showConfirmationPrompt && (
					<ConfirmationPrompt
						userId='userId'
						spotId={this.state.chosenSpot}
						imageUrl={this.state.imageURL}
						cancelCallback={
							this.cancelCallback
						}
						timeDelta={this.props.timeDelta}
						price={this.state.price}
						spot={this.state.spot}
						startDate={this.props.startDate}
						endDate={this.props.endDate}
						ratingAverage={
							this.state.ratingAverage
						}
						ratingNumber={
							this.state.ratingNumber
						}
					/>
				)}
			</div>
		);
	}
}

export default withStyles(styles)(ListingsContainer);
