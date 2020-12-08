import React, { useEffect, useState, useRef, useCallback } from "react";
import { GoogleMap,  useLoadScript,  Marker,  InfoWindow, Circle } from "@react-google-maps/api";
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
import usePlacesAutocomplete from "use-places-autocomplete";
import Pagination from '@material-ui/lab/Pagination';


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
    // padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    height: "100vh"
  }
}));

const ListItemLink = (props) => {
  return <ListItem button component="a" {...props} />;
}

const Map = () => {

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
    } = usePlacesAutocomplete();

  let proxy;

  if (process.env.NODE_ENV === 'production') {
    proxy = 'YOUR HEROKU URL'
  } else {
    proxy = 'http://localhost:3000'
  }

  const classes = useStyles();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const apiKey = process.env.REACT_APP_IPIFY_API_KEY //IPIFY API
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
  const [hideList, setHideList] = useState(true);  // show and hide List beside the map

  const [page, setPage] = useState(2)

  // toggle list
  const handleClick = () => {
    setHideList(s => !s);
  };

  const [selected, setSelected] = useState(null); 
  const [watchlist, setWatchlist] = useState([]);

  console.log({myPlaces: myPlaces})
  console.log({selected: selected})
  console.log({watchlist: watchlist})
  //const myIcon = "https://developers.google.com/maps/documentation/javascript/examples/full/images/library_maps.png"

  //  "proxy": "https://maps.googleapis.com/maps/api/place/nearbysearch/", 
  
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
      .then(data => {
        setMyPlaces(data)
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

  if (loadError) return "Error";
  if (!isLoaded) return "Loading...";

  return (
    <div className={classes.root}>
      <Grid container spacing={0} >
          <Grid item xs={hideList ? 12 : 9} >
            <Paper className={classes.paper} elevation = {3} >
              <Grid container >
                  <h1>
                    Gluten Free Finder{" "}
                    <span role="img" aria-label="check">
                      🔎
                    </span>
                  </h1>
                  {/* <button
                      className="watchlist"
                      onClick={handleClick}
                      style={{outline: 'none'}}
                  >
                      <img src="/magnifier.svg" alt="showPlaceLists" />
                  </button> */}
                  <button
                      className="placeList"
                      onClick={handleClick}
                      style={{outline: 'none'}}
                  >
                      <img src="/magnifier.svg" alt="showPlaceLists" />
                  </button>

                <Locate panTo={panTo} onCenter={setCenter} setValue={setValue}/> 
                <Search panTo={panTo} onCenter={setCenter} setValue={setValue} value={value} clearSuggestions={clearSuggestions} status={status} data={data} ready={ready}/>

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
                      radius={1000}
                      options={{
                        strokeColor: "transparent"
                        }}
                        /> 
                  { myPlaces && 
                    myPlaces.map((myPlace)=>
                    <Marker 
                      key = {myPlace.place_id} 
                      position = {{ lat: myPlace.geometry.location.lat, lng: myPlace.geometry.location.lng }} 
                      // icon = {myIcon}
                      // animation = {Animation.DROP}
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
                        <button value={selected.place_id} 
                                onClick ={()=>{ setWatchlist([...watchlist, selected] )}}> 
                          Add to Watchlist
                          </button>
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
    </div>
  );
}

export default Map
