import React, { useEffect, useState, useRef, useCallback } from "react";
import { GoogleMap,  useLoadScript,  Marker,  InfoWindow, Circle } from "@react-google-maps/api";
import axios from "axios";
import "@reach/combobox/styles.css";
import mapStyles from "./mapStyles";
import Locate from './Locate';
import Search from './Search';
import { makeStyles, Paper, Grid, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, AppBar, Toolbar, Typography, Button, IconButton  } from "@material-ui/core";
import FavoriteIcon from '@material-ui/icons/Favorite';
import Pagination from '@material-ui/lab/Pagination';

const mapContainerStyle = {
  height: "93vh",
  width: "100vw",
};
const google = window.google = window.google ? window.google : {}

//Snazzy Blue Essence
const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
  // zoomControlOptions: {
  //   position: google.maps.ControlPosition.LEFT_CENTER,
  // },
};

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  appBar: {
    background: "#6ECBCF",
    // background: "transparent",  
  },
  title: {
    flexGrow: 1,
    width: "40%",
  },
  searchLocate: {
    alignItems:"center",
    justifyContent: "start",
  },
  listIcons: {
    alignItems:"center",
    justifyContent: "center",
  },
  paper2: {
    paddingLeft: theme.spacing(1),
    color: theme.palette.text.primary,
    height: "100%",
    overflow: "auto"
  },
  mapWrapper:{
    left: "0",
  },
  listWrapper:{
    position: "absolute",
    right: "0",
    height: "93vh",
  },
  placeList: {
    top: "1rem",
    right: "4rem",
    background:" none",
    border: "none",
    zIndex: 10,
  },
  listButton: {
    width: "30px",
    cursor: "pointer",
  },
}));

const ListItemLink = (props) => {
  return <ListItem button component="a" {...props} />;
}

const libraries = ["places"];

const Map = ({userData, setUserData}) => {
  const classes = useStyles();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  let proxy;
  if (process.env.NODE_ENV === 'production') {
    proxy = 'https://gluten-free-api.herokuapp.com'
  } else {
    proxy = 'http://localhost:3000'
  }

console.log({userData:userData})

  const apiKey = process.env.REACT_APP_IPIFY_API_KEY
  const myIpUrl = `https://geo.ipify.org/api/v1?apiKey=${apiKey}`

  const [center, setCenter] = useState({
      lat: 52.5200,
      lng: 13.4050 //Berlin Center
  });  
  
  const [centerError, setCenterError] = useState(false);

  const [myPlaces, setMyPlaces] = useState(null);    
  const [hideList, setHideList] = useState(true);  // show and hide List beside the map

  const [page, setPage] = useState(1)

  // toggle list
  const handleClick = () => {
    setHideList(s => !s);
  };

  const [selected, setSelected] = useState(null); 
  const [watchlist, setWatchlist] = useState(userData && userData.watch_list);

  console.log({myPlaces: myPlaces})
  console.log({selected: selected})
  console.log({watchlist: watchlist})
  
  const handleCenterError = () => {
      setCenterError(true);
      setCenter({
        // default washington location
        lat: 38.909707628426034,
        lng: -77.05981684253995
      })
  }

  const handlePagination = places => {
    const slicedPlaces = places.slice(page === 1 ? 0 : (page - 1) * 10, page === 1 ? 10 : ((page - 1) * 10) + 10)
    console.log(slicedPlaces)
    return slicedPlaces
  }

  // set user current position to Map Center
  useEffect(() => {
      if (!navigator.geolocation) {
        handleCenterError();
      } else {
        navigator.geolocation.getCurrentPosition(
          position => 
            setCenter({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          async () => {
              try {
                const {data: { location : { lat, lng }} } = await axios.get(myIpUrl);   
                setCenter({
                  lat, lng
                })
              }
              catch (e) {
                handleCenterError()
              }
          }        
        );
      }
    }, []);

  // Fetch glutenfree restaurant from Google Places API  
  // data.results is an Array of 20 objects
  useEffect(() => {
      fetch(`${proxy}/map`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({lat: center.lat, lng: center.lng})
      })
      .then((response) => response.json())
      .then(result => {
        setMyPlaces(result)
      })
      .catch(error=> console.error('Error:', error))
  },[center])

//accessing inside the code does not cause rerendering
//useState makes render, useRef retain the state from rerendering
  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(12);
  }, []);

  // Update User's Watchlist
  const handleAddToWatchList = (selected) => {
    setWatchlist([...watchlist, {...selected, google_place_id: selected.place_id}])
    // setWatchlist(preWatchList => [...preWatchList, selected] )
    fetch(`${proxy}/user/watchlist`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({user: userData._id, selected})
    })
    .then((response) => response.json())
    .then(result => {
      setUserData(result)
    })
    .catch(e => console.error({AddToWatchListError: e.message}))
}

  if (loadError) return "Error";
  if (!isLoaded) return "Loading...";

  return (
  // { userData &&
  <>
    <div className={classes.root}>
        <Grid container >
            <AppBar position="static" className={classes.appBar}>
              <Toolbar>
                <Typography variant="h5" className={classes.title}>
                  Gluten Free Finder{" "}
                        <span role="img" aria-label="check">
                          🔎
                        </span>
                </Typography>
                <Grid item container className={classes.searchLocate}>
                    <Search panTo={panTo} onCenter={setCenter} />
                </Grid>
                <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                  <Locate panTo={panTo} onCenter={setCenter}/>
                </IconButton>
                <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                  <Grid>
                          <button
                              className="placeList"
                              onClick={handleClick}
                              style={{outline: 'none'}}
                          >
                              <img src="/magnifier.svg" alt="showPlaceLists" />
                          </button>
                    </Grid>
                </IconButton>
                {/* <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                  <Grid item>
                          <button
                              className="myWatchlist"
                              onClick={handleClick}
                              style={{outline: 'none'}}
                          >
                              <img src="/pin.svg" alt="showMyWatchlists" />
                          </button>
                    </Grid>
                </IconButton> */}
              </Toolbar>
            </AppBar>
          <Grid container className={classes.bodyWrapper}>
            <Grid item xs={hideList ? 12 : 12} style={{position: "absolute", left: "0"}} className={classes.mapWrapper}>
                <Grid item xs = {12} container >            
                    <GoogleMap
                      id="map"
                      mapContainerStyle={mapContainerStyle}
                      zoom={12}
                      center={center}
                      options={options}
                      onLoad={onMapLoad}
                      >
                      <Circle 
                          center={center}
                          radius={500}
                          options={{
                            strokeColor: "transparent",
                            fillColor: "#FF0000",
                            fillOpacity: 0.35,
                            }}
                            /> 
                      { myPlaces && 
                        myPlaces.map((myPlace)=>
                        <Marker 
                          key = {myPlace.place_id} 
                          position = {{ lat: myPlace.geometry.location.lat, lng: myPlace.geometry.location.lng }} 
                          onClick ={()=> setSelected(myPlace)}
                        />
                        )}

                      { selected ? (
                        <InfoWindow
                          position={{ lat: selected.geometry.location.lat, lng: selected.geometry.location.lng }}
                          onCloseClick={() => {
                            setSelected(null);
                          }}
                        >
                          <div>
                            <h2>{selected.name}</h2>
                            <h4>Address: {selected.vicinity}</h4>
                            <h4> Rating: {selected.rating}</h4>
                            { watchlist && 
                              watchlist.find(watchlistPlace => watchlistPlace.google_place_id === selected.place_id)
                              ? "":( 
                              <button value={selected.place_id} 
                                      onClick ={()=> handleAddToWatchList(selected)}> 
                                Add to Watchlist
                              </button>
                              )
                            }
                          </div>
                        </InfoWindow>
                      ) :  null }
                    </GoogleMap>
                </Grid>
            </Grid>
          {!hideList && (
            <Grid item xs={3} className={classes.listWrapper}>
              <Paper  className={classes.paper2}>
              { myPlaces && 
                handlePagination(myPlaces).map((myPlace)=> (
                  <>
                    <List component="nav" key = {myPlace.place_id} >
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                          { selected &&  
                                selected.place_id === myPlace.place_id?
                              <FavoriteIcon color="secondary"/> 
                            :
                            <FavoriteIcon />                         
                            } 
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={myPlace.name} secondary={myPlace.vicinity}/>
                      </ListItem>
                    </List>
                    <Divider />
                  </>
                  )
                )}
                <Pagination count={Math.floor(myPlaces.length / 10)} onChange={(e, page) => setPage(page)} />
              </Paper>
            </Grid>
          )}
          </Grid>
        </Grid>
      </div>
    </>
      // }
  );
}

export default Map
