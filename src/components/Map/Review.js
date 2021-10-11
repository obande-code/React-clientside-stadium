import React, {Component} from 'react';
import Rating from "@material-ui/lab/Rating";
import ShowMoreText from "react-show-more-text";
import { Tab, Tabs, withStyles } from "@material-ui/core";


import confirmationPromptStyles from "./styles";

class Review extends Component {

    getReviews() {
        let spot = this.props.spot;
        let ratings = spot["reviews_ratings"]

        let ratingsWithReviews = [];
        for(const x in ratings) {
            if(x.review !== null){
                ratingsWithReviews.push(ratings[x])
            }
        }
        return ratingsWithReviews
    }

    renderReview(review) {
        const { classes } = this.props;
        return (
            <li>
                <div className={classes.reviewPhoto}>
                    <img src="avatar.png" alt="" />
                </div>
                <div className={classes.review}>
                    <h6>{review.userName}</h6>
                    <p>{review.date}</p>
                    <Rating
                        value={review.rating || 5}
                        size="small"
                        readOnly
                    />
                    <ShowMoreText
                        lines={6}
                        more="Read more"
                        less="Read less"

                        //anchorClass={`showText ${!textShowMore ? "more" : "less"}`}
                        onClick={() =>
                            this.setState((prev) => ({
                                textShowMore: !prev.textShowMore,
                            }))
                        }
                        expanded={false}
                    >
                        {review.review || ""}
                    </ShowMoreText>
                </div>
            </li>
        )
    }


    render() {
        let ratings = this.getReviews()
        let renderedReviews = []

        for (const x in ratings) {
            renderedReviews.push(this.renderReview(ratings[x]))
        }
        return (
            <div>
                {renderedReviews.length ? renderedReviews : "This space has no review yet"}
            </div>
        );
    }
}

export default withStyles(confirmationPromptStyles)(Review);