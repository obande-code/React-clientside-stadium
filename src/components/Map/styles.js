import { makeStyles } from "@material-ui/core";

const confirmationPromptStyles = (theme) => ({
    confirmContainer: {
        backgroundColor: "#fff",
        borderRadius: 4,
        margin: '-40px 10px 0',
        width: 'calc(100% - 20px)',
        height: 'calc(100% - 115px)',
        position: 'relative',
        '& ul': {
            listStyleType: 'none',
            listStylePosition: 'outside',
        },
        [theme.breakpoints.down('sm')]: {
            height: 'calc(100vh - 20px)',
        }
    },
    closeIcon: {
        position: 'absolute',
        top: 18,
        right: 18,
        cursor: 'pointer'
    },
    confirmData: {
        padding: '30px 30px 0 20px'
    },
    spotName: {
        fontSize: 12,
        fontWeight: '400',
        '& span:first-child': {
            fontSize: 11,
            lineHeight: '16px',
            color: '#1fa637',
            fontWeight: 700,
        },
        '& span:nth-child(2)': {
            fontWeight: 700,
        }
    },
    spotRating: {
        display: 'flex',
        marginTop: 5,
        '& span': {
            fontSize: 14,
        },
        '& p': {
            paddingLeft: 4,
            fontSize: 12,
            lineHeight: '14px',
            margin: 0,
        }
    },
    bookingDate: {
        marginTop: 25,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bookingDateDetail: {
        display: 'flex',
        flexDirection: 'column',
        flex: '0 1 auto',
        width: 'auto',
        '& span:first-child': {
            fontSize: '0.6rem',
            marginBottom: 2,
        },
        '& span:last-child': {
            fontSize: '0.7rem',
            fontWeight: '700'
        }
    },
    sep: {
        background: 'url(arrow-right.svg)',
        width: 15,
        height: 15
    },
    standoutBar:{
        display: 'flex',
        justifyContent: 'center',
        borderTop: '1px solid rgba(205,211,219,.25)',
        borderBottom: '1px solid rgba(205,211,219,.25)',
        padding: '13px 10px',
        margin: '25px -30px 0 -20px',
        '& > div:nth-child(2)': {
            borderLeft: '1px solid #cdd3db',
            borderRight: '1px solid #cdd3db',
        }
    },
    standoutBarItem: {
        flex: 1,
        padding: '0 10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    standoutBarItemValue: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 16,
        fontWeight: '700'
    },
    standoutBarItemTitle: {
        fontSize: '0.6rem',
        textTransform: 'capitalize',
        textAlign: 'center',
    },
    workIcon: {
        width: '1.25rem',
        height: '1.25rem',
    },
    tabContent: {
        height: 'calc(100vh - 500px)',
        overflow: 'auto',
        [theme.breakpoints.down('sm')]: {
            height: 'calc(100vh - 355px)',
        },
    },
    inforBox: {
        margin: '10px 20px 20px',
        backgroundColor: '#eef9ff',
        padding: '15px 18px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: 4,
        '& svg': {
            width: 24,
            height: 24,
        },
        '& p': {
            margin: 0,
            fontSize: '16px',
            fontWeight: '700',
            lineHeight: 1.63,
            color: '#2f9fed',
            marginLeft: 14,
            '& a': {
                color: '#2f9fed',
                textDecoration: 'underline'
            }
        },
    },
    facilities: {
        margin: 20,
        padding: 0,
        display: 'flex',
        flexWrap: 'wrap',
        '& li': {
            display: 'block',
            textAlign: 'center',
            fontSize: 10,
            flex: '0 1 25%',
            margin: '8px 0',
            textTransform: 'capitalize',
            '& svg': {
                width: 24,
                height: 24
            },
            '& p': {
                fontSize: 10,
                margin: '10px 0 0'
            }
        }
    },
    facilitiesCount: {
        margin: '0 !important',
        height: 30,
        fontSize: '26px !important',
        lineHeight: '1',
        color: '#0f7277',
    },
    facilitiesText: {
        color: '#0f7277',
        fontWeight: 700,
        fontSize: '8px !important',
    },
    content: {
        position: 'relative',
        margin: 20,
        fontSize: '0.7rem'
    },
    streetView: {
        textTransform: 'none',
        margin: '20px 20px 0',
        width: 'calc(100% - 40px)',
        color: '#21303e',
        border: '1px solid #21303e',
        '& span:first-child': {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        },
        '& svg': {
            marginRight: 5,
        }
    },
    gallery: {
        display: 'flex',
        margin: '10px 20px',
    },
    galleryItem: {
        width: '50%',
        paddingBottom: '38%',
        overflow: 'hidden',
        marginRight: 10,
        position: 'relative',
        cursor: 'pointer',
        '& img': {
            maxWidth: 'none',
            height: '100%',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            position: 'absolute',
            borderRadius: '4px',
            width: '100%',
            objectFit: 'cover',
        },
        '&:last-of-type': {
            marginRight: 0,
        }
    },
    confirmSelect: {
        // Comment out absolute
        // position: 'absolute',
        bottom: '0',
        width: '100%',
        borderTop: '1px solid #cdd3db',
        '& button': {
            width: 'calc(100% - 40px)',
            margin: '16px 20px',
            padding: 0,
            lineHeight: 3,
            fontSize: '0.8rem',
            textTransform: 'none',
            transition: 'background-color .2s linear',
            backgroundColor: '#0f7277 !important',
            color: '#ffffff',
        }
    },
    tabs: {
        margin: '0 20px',
        borderBottom: "1px solid #cdd3db",
        zIndex: -1
    },
    tab: {
        minWidth: "unset",
        '& span': {
            textTransform: 'none',
            fontSize: '0.7rem',
            fontWeight: '700'
        }
    },
    reviews: {
        margin: 20,
        padding: 0,
        '& li': {
            borderTop: '1px solid #efefef',
            paddingTop: 20,
            paddingBottom: 30,
            marginBottom: 20,
            display: 'flex',
        },
        '& li:first-child': {
            borderTop: 'transparent',
            paddingTop: 0
        },
        '& li:last-child': {
            borderBottom: '1px solid #efefef',
        },
        '& h6': {
            fontSize: '0.9rem',
            margin: 0
        },
        '& h6 + p': {
            fontSize: '0.7rem',
            lineHeight: '1.5rem',
            marginTop: 0,
            marginBottom: 3
        },
        '& p + span': {
            fontSize: '0.9rem',
        },
    },
    reviewRead: {
        color: '#1fa637',
        display: 'block',
        marginTop: 10,
        fontSize: '0.9rem',
        cursor: 'pointer',
        "&::after": {
            content: "''",
            display: 'inline-block',
            background: "url('https://static.justpark.com/web/assets/arrow_down.8cc77bd81836246bc46bbef4768c59cc.svg') 0 5px no-repeat",
            width: "10px",
            height: "12px",
            marginLeft: "8px"
        }
    },
    reviewPhoto: {
        verticalAlign: 'top',
        float: 'left',
        display: 'inline-block',
        minWidth: 48,
        height: 48,
        borderRadius: '50%',
        overflow: 'hidden',
        boxSizing: 'content-box',
        position: 'relative',
        marginRight: 15,
        '& img': {
            position: 'absolute',
            width: 48,
            height: 48
        },
    },
    reviewDetail: {
        position: 'relative',
        fontSize: '0.9rem',
        margin: 0,
        lineHeight: '1.4rem'
    },
    park: {
        padding: "25px 0",
        fontSize: '0.7rem',
        color: '#3e3e3e',
        '& ul': {
            marginRight: 25,
            paddingLeft: 25,
        },
        '& li': {
            display: 'flex',
            alignItems: 'center',
            paddingBottom: 20,

            '& img': {
                marginRight: 15,
                width: 60,
                height: 60,
                flexShrink: 0
            }
        },
        '& li div > p:first-child': {
            fontWeight: 'bold',
            fontSize: '0.9rem',
            marginTop: 0,
            marginBottom: 5
        },
        '& li div > p:last-child': {
            margin: 0,
            fontSize: '0.8rem',
            lineHeight: '1.3rem'
        }
    }
});

export default confirmationPromptStyles;

export const listingExplorerStyles = (theme) => ({
    listings: {
        display: 'block',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        }
    },
    activeListings: {
        display: 'block',
    },
    listingsPaper: {
        width: theme.layout.listingBar.width,
        background: "#efefef",
        boxShadow: "0 0 2px 1px rgb(0 0 0 / 20%)",
        zIndex: 1,
        paddingTop: 155,
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            paddingTop: 0,
            zIndex: 3,
        }
    },
    tabs: {
        margin: "0 10px",
        borderBottom: "1px solid #cdd3db",
        zIndex: -1
    },
    tab: {
        minWidth: 'unset',
        color: '#999',
        fontWeight: '700',
        fontSize: '0.7rem',
    },
    spotData: {
        position: 'absolute',
        zIndex: 1,
        bottom: 10,
        backgroundColor: '#fff',
        borderRadius: 4,
        padding: 10,
        left: '2%',
        width: '90%',
        display: 'none',
        cursor: 'pointer',
        [theme.breakpoints.down('sm')]: {
            display: 'block',
        }
    },
    spotName: {
        fontSize: 12,
        fontWeight: '400',
        '& span:first-child': {
            fontWeight: 700,
        }
    },
    spotRating: {
        display: 'flex',
        marginTop: 5,
        '& span': {
            fontSize: 14,
        },
        '& p': {
            paddingLeft: 4,
            fontSize: 12,
            lineHeight: '14px',
            margin: 0,
        }
    },
    minutes: {
        display: 'flex',
        fontSize: 12,
        fontWeight: '700',
        margin: '7px 0 4px',
        '& span': {
            color: '#1fa637'
        }
    },
    workIcon: {
        width: '1.25rem',
        height: '1.25rem',
        marginRight: 4
    },
    selectButton: {
        width: '100%',
        margin: '7px 0 0',
        padding: 0,
        lineHeight: 3,
        fontSize: '0.8rem',
        textTransform: 'none',
        transition: 'background-color .2s linear',
        backgroundColor: '#0f7277 !important',
        color: '#ffffff'
    },
    mobileConfirmationContent: {
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: 1,
        display: 'none',
        [theme.breakpoints.down('sm')]: {
            display: 'block',
        },
        '& > div': {
            top: 0,
            width: '100%',
            margin: 0,
            height: '100vh',
        }
    }
});

export const mapStyles = makeStyles(theme => ({
    mainMap: {
        marginLeft: theme.layout.listingBar.width,
        marginTop: 80,
        [theme.breakpoints.down('sm')]: {
            marginLeft: 0,
            marginTop: 0,
        },
        '& > div': {
            height: 'calc(100vh - 150px) !important',
            [theme.breakpoints.down('sm')]: {
                height: 'calc(100vh - 70px) !important',
            },
        }
    }
}));

export const mapPinStyles = makeStyles(() => ({
    pinContainer: {
        minWidth: 40,
        borderRadius: 3,
        padding: 6,
        border: '1px solid gray',
        borderLeft: '5px solid #0f7277',
        cursor: 'pointer',
        fontWeight: '500',
        color: '#000000',
        background: '#ffffff',
        display: 'inline-block',
        '&::before': {
            content: 'attr(data-content)',
            fontSize: 19,
            fontWeight: '600',
        },
        '&.active': {
            backgroundColor: '#21303e',
            color: '#ffffff',
        },
    },
    pinStyle: {
        fontSize: 18,
        fontWeight: '600',
    }
}));
