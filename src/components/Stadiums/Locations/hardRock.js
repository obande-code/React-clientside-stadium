import React, {Component} from 'react';
import EventComponent from "../Event"

import { Grid, Paper, withStyles } from "@material-ui/core";

class HardRock extends Component {

    componentDidMount() {
        this.render()
    }

    render() {
        let link = "/search?lat=25.9579665&lng=-80.2388604&place_id=ChIJqfO1lwSv2YgR2_kLxpThFVg&address=Hard%20Rock%20Stadium,%20Don%20Shula%20Dr,%20Miami%20Gardens,%20FL,%20USA&arriving=Fri%20Oct%2001%202021%2021:00:00%20GMT-0400%20(Eastern%20Daylight%20Time)&leaving=Fri%20Oct%2001%202021%2023:00:00%20GMT-0400%20(Eastern%20Daylight%20Time)"
        let date = "Sun, Oct 10 2:00PM"
        let game = "Jacksonville Jaguars at Miami Dolphins"
        let date2 = " "

        return (
            <div>
                <Grid container>
                    <Grid item xs={8} >
                        <EventComponent linkToMap={link} date={date} game={game}></EventComponent>
                    </Grid>
                    <Grid item xs={8}>
                        <EventComponent linkToMap={link} date={date} game={game}></EventComponent>
                    </Grid>
                    <Grid item xs={8}>
                        <EventComponent linkToMap={link} date={date} game={game}></EventComponent>
                    </Grid>

                </Grid>


            </div>
        );
    }
}

export default HardRock;