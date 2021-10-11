import React from "react";
import {
    ListItem,
    ListItemIcon,
    ListItemText,
    withStyles,
} from "@material-ui/core";
import RoomIcon from "@material-ui/icons/Room";
import GpxFixedIcon from "@material-ui/icons/GpsFixed";
import SearchIcon from "@material-ui/icons/Search";
import Autosuggest from "react-autosuggest";
import usePlacesAutoComplete from "use-places-autocomplete"
import theme from "./SearchBar.module.css";
import firebase from "firebase/app";

const styles = (theme) => ({
    filterContainer: {
        position: "relative",
        display: "flex",
        flex: 1,
        [theme.breakpoints.down("sm")]: {
            "& > div:first-child": {
                borderRadius: "0px !important",
                border: "transparent !important",
                borderBottom: "1px solid #e4e4e4 !important",
            },
        },
        "& .home-filter input": {
            padding: "28px 14px 14px 16px !important",
        },
    },
    searchIcon: {
        position: "absolute",
        left: 15,
        top: 18,
        width: 24,
        height: 24,
        color: "#0f7277",
    },
});


const getSuggestionValue = (suggestion) => suggestion.description;

// the elements that get created when user types in search bar
const renderSuggestion = (suggestion) => {
    return(
        <ListItem button>
            <ListItemIcon>
                <RoomIcon />
            </ListItemIcon>
            <ListItemText>{suggestion.description}</ListItemText>
        </ListItem>
    );
}

const SearchBar = ({parentCallback,search,value:propValue,classes,...props}) => {
    const [suggestion,setSuggestion] = React.useState([])
    const [trueValue,setTrueValue] = React.useState({
        method:"",
        value:""
    })
    const {
        value,
        suggestions:{
            data
        },
        setValue,
        clearSuggestions
    } = usePlacesAutoComplete({
        // debounce:300,
        defaultValue:propValue ?? ""
    })

    React.useEffect(() => {
        // if(data.length){
            setSuggestion([...data])
        // }
    },[data])

    // Maintain an external state apart from the usePlaces
    React.useEffect(() => {
        if(trueValue.method === "type"){
            setValue(trueValue.value)
        }
    },[trueValue])
    

    const setSuggestionOnValue = (filterBy) => {
        const testString = new RegExp(filterBy,"i")
        const filteredSuggestion = data.filter(item => testString.test(item.place_id))
        setSuggestion(filteredSuggestion)
    }

    const onChange = (event, { newValue, method }) => {
        setTrueValue({
            method,
            value:newValue
        })
        //TODO: is choosing first one needs to choose the one that is clicked
        // when there is a click, we send a callback to the parent (home) and
        // then start the map and listing explorer
        /* if (method === "click") {
          let selection = this.state.suggestions[0];
          this.props.parentCallback(selection);
        }*/
    };

    const onSuggestionSelected = (
        event,
        { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
    ) => {   
        if (method === "click") {
            parentCallback({placeId:suggestion.place_id,name:suggestion.description});
            setSuggestionOnValue(suggestion.place_id)
            firebase.analytics().logEvent("searched_location", {location: suggestion.description})
        }
    };

    // whenever user edits the search bar, sends a request to google to get suggestions
    const onSuggestionsFetchRequested = ({ reason,value:currentValue }) => {
        if(reason === "input-changed" && currentValue != value){
            setValue(currentValue)
        }
    };

    const inputProps = {
        placeholder: propValue || "Where do you want to park?",
        value:trueValue.value,
        onChange
    };

    /* if (this.props.value !== "") {
      inputProps = {
        placeholder: "Search...",
        value: this.props.value,
        onChange: this.onChange,
        style,
      };
    }*/

    return (
        <div className={classes.filterContainer}>
            {search && (
                <div
                    style={{
                        border: "1px solid #c4c4c4",
                        width: "100%",
                        height: 54,
                        borderRadius: 5,
                        position: "absolute",
                    }}
                />
            )}
            <div
                className={search ? "search-filter" : "home-filter"}
                style={{ marginLeft: 0, width: "100%", zIndex: "2" }}
            >
                <Autosuggest inputProps={inputProps} 
                    shouldRenderSuggestions={() => !!suggestion.length}
                    onSuggestionSelected={onSuggestionSelected}
                    suggestions={suggestion} theme={theme}
                    onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={clearSuggestions}
                    getSuggestionValue={getSuggestionValue}
                    renderSuggestion={renderSuggestion}
                />
            </div>

            {search && <SearchIcon className={classes.searchIcon} />}
            {search && (
                <div
                    className={theme.label}
                    style={{
                        fontSize: 14,
                        textTransform: "inherit",
                        marginTop: -15,
                        background: "#fff",
                        paddingLeft: 6,
                        paddingRight: 6,
                    }}
                >
                    Parking At
                </div>
            )}
            {!search && <label className={theme.label}>Parking At</label>}
            {search && <GpxFixedIcon color="primary" className={theme.location} />}
        </div>
    );
}

export default withStyles(styles)(SearchBar);