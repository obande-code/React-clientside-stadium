import React, {Component} from 'react';

import { Grid, Paper, withStyles } from "@material-ui/core";
import { Link } from "react-router-dom";
import ticket from "../../images/tickets.png"
import { withRouter } from 'react-router-dom';

const styles = () => ({
    photo: {
    height: 25,
    width: 25
}
});
class EventComponent extends Component {

    constructor(props) {
        super(props);


        this.state = {
            date: this.props.date,
            linkToMap: this.props.linkToMap
        };

    }

    componentDidMount() {
        this.render()
    }



    render() {
        const handleOnClick = () => this.props.history.push(this.props.linkToMap)
        const { classes } = this.props;
        return (
            <div>
                <Grid container onClick={handleOnClick}>
                    <Grid item xs={8}>
                        <img src={ticket} alt="" className={classes.photo}/>
                    </Grid>
                        <Grid container>

                            <Grid item xs={8}>
                                <span>
                                    {this.props.game}
                                 </span>
                            </Grid>
                            <Grid item xs={8}>
                                <span>
                                    {this.state.date}
                                 </span>
                            </Grid>
                        </Grid>
                    </Grid>

            </div>
        );
    }
}

export default withRouter(withStyles(styles)(EventComponent));