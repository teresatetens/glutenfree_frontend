//// before implementing material ui appbar

import React, { useEffect, useState, useRef, useCallback } from "react";
import { GoogleMap,  useLoadScript,  Marker,  InfoWindow } from "@react-google-maps/api";
import axios from "axios";
import "@reach/combobox/styles.css";
import mapStyles from "./mapStyles";
import Locate from './Locate';
import Search from './Search';
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';

const libraries = ["places"];

const mapContainerStyle = {
  height: "100vh",
  width: "100vw",
};

//Snazzy Blue Essence
const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
};

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary
  }
}));

const ListItemLink = (props) => {
  return <ListItem button component="a" {...props} />;
}
const Map = () => {
  const classes = useStyles();
  const [hideList, setHideList] = useState(true);  //something = false;
  const handleClick = () => {
    setHideList(s => !s);
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  
  const apiKey = process.env.REACT_APP_IPIFY_API_KEY
  const myIpUrl = `https://geo.ipify.org/api/v1?apiKey=${apiKey}`

  const [center, setCenter] = useState({
      lat: 52.5200,
      lng: 13.4050 //Berlin Center
  });  
  console.log({center: center})
  
  const [centerError, setCenterError] = useState(false);

  const [radius, setRadius] = useState(30000);
  const [type, setType] = useState('restaurant');
  const [keyword, setKeyword] = useState('gluten');

  const [myPlaces, setMyPlaces] = useState(null);  
  const [selected, setSelected] = useState(null); 

  console.log({myPlaces: myPlaces})
  console.log({selected: selected})
  //const myIcon = "https://developers.google.com/maps/documentation/javascript/examples/full/images/library_maps.png"

  const glutenFreeQuery = `json?location=${center.lat},${center.lng}&radius=${radius}&sensor=true&types=${type}&keyword=${keyword}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
  //  "proxy": "https://maps.googleapis.com/maps/api/place/nearbysearch/", 
  
  const handleCenterError = () => {
      setCenterError(true);
      setCenter({
        // default washington location
        lat: 38.909707628426034,
        lng: -77.05981684253995
      })
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
      fetch(glutenFreeQuery)
      .then((response) => response.json())
      .catch(error=> console.error('Error:', error))
      .then(data => {
        setMyPlaces(data.results)
      })
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

  if (loadError) return "Error";
  if (!isLoaded) return "Loading...";

  return (
    <div className={classes.root}>
      <Grid container spacing={1} >
          <Grid item xs={hideList ? 12 : 9} >
            <Paper className={classes.paper} elevation = {3} >
              <Grid container >
                  <h1>
                    Gluten Free Finder{" "}
                    <span role="img" aria-label="check">
                      🔎
                    </span>
                  </h1>
                  <button
                      className="placeList"
                      onClick={handleClick}
                      style={{outline: 'none'}}
                      // onClick={() => {
                      //   setHideList(false)
                      // }}
                  >
                      <img src="/magnifier.svg" alt="showPlaceLists" />
                  </button>
                <Locate panTo={panTo} onCenter={setCenter}/> 
                <Search panTo={panTo} onCenter={setCenter} />

                <GoogleMap
                  id="map"
                  mapContainerStyle={mapContainerStyle}
                  zoom={12}
                  center={center}
                  options={options}
                  onLoad={onMapLoad}
                  >
                  { myPlaces && 
                    myPlaces.map((myPlace)=>
                    <Marker 
                      key = {myPlace.place_id} 
                      position = {{ lat: myPlace.geometry.location.lat, lng: myPlace.geometry.location.lng }} 
                      // icon = {myIcon}
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
                        <p> Address: {selected.vicinity}</p>
                        <p> Rating: {selected.rating}</p>
                        <button value={selected.place_id}> Add to Watchlist</button>
                        {/* <button value={selected.place_id}> Write a review</button> */}
                        {/* {selected.photos[0].html_attributions[0]} */}
                      </div>
                    </InfoWindow>
                  ) :  null }
                </GoogleMap>
              </Grid>
            </Paper>
          </Grid>
        {!hideList && (
          <Grid item xs={3}>
            <Paper className={classes.paper}>
            { myPlaces && 
              myPlaces.map((myPlace)=> (
                <>
                  <List component="nav" key = {myPlace.place_id} >
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                        { selected ?  
                          <FavoriteIcon color="secondary"/> :
                          <FavoriteIcon /> 
                        } 
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={myPlace.name} secondary={myPlace.vicinity} />
                    </ListItem>
                  </List>
                  <Divider />
                </>
                    )
                  )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </div>
  );
}

export default Map