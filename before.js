import React, { useEffect, useState, useRef, useCallback } from "react";
import { GoogleMap,  useLoadScript,  Marker,  InfoWindow } from "@react-google-maps/api";
import usePlacesAutocomplete, { getGeocode, getLatLng }  from "use-places-autocomplete";
import {Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption} from "@reach/combobox";
import axios from "axios";
import "@reach/combobox/styles.css";
import mapStyles from "./mapStyles";

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

export default function App()  {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  
  const apiKey = process.env.REACT_APP_IPIFY_API_KEY
  const myIpUrl = `https://geo.ipify.org/api/v1?apiKey=${apiKey}`

  const [center, setCenter] = useState({
      lat: 38.909707628426034,
      lng: -77.05981684253995
  });  

  console.log('there')
  
  // const [center, setCenter] = useState(null);
  console.log({center: center})
  
  const [centerError, setCenterError] = useState(false);
  const [googleMapsApiError, setGoogleMapsApiError] = useState(null);

  const [radius, setRadius] = useState(20000);
  const [type, setType] = useState('restaurant');
  const [keyword, setKeyword] = useState('gluten');

  const [myPlaces, setMyPlaces] = useState(null);  
  const [selected, setSelected] = useState(null); 

  console.log({myPlaces: myPlaces})
  console.log({selected: selected})

  const glutenFreeQuery = `json?location=${center.lat},${center.lng}&radius=${radius}&sensor=true&types=${type}&keyword=${keyword}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`

    // gp_id: results.place_id
    // lat: results.geometry.location.lat,
    // lng: results.geometry.location.lng,
    // name: results.name,
    // address: results.vicinity,
    // rating: results.rating,

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

  useEffect(() => {
      fetch(glutenFreeQuery)
      .then((response) => response.json())
      .catch(error=> console.error('Error:', error))
      .then(data => {
        setMyPlaces(data.results)
      })//data.results is an Array of 20 objects
  },[center])

 // fetch glutenfree restaurant near users current location
  // useEffect(() => {
  //   const fetchGlutenFreePlaces = async () => {
  //     const gfPlaces = await axios
  //       .get(glutenFreeQuery)
  //       .then(res => res && console.log(res.data))
  //       .catch(error => setGoogleMapsApiError(error.message))
  //     return gfPlaces;
  //   };
    // if (center) {
    //   fetchGlutenFreePlaces().then(data => {
    //     if (data) {
    //       setMyPlaces(data.results);
    //     }
    //   });
    // }
  // }, [center]);


  //accessing inside the code does not cause rerendering
  //useState makes render, useRef retain the state from rerendering
  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, []);

  if (loadError) return "Error";
  if (!isLoaded) return "Loading...";

  return (
    <div>
      <h1>
        Gluten Free Finder{" "}
        <span role="img" aria-label="check">
          🔎
        </span>
      </h1>

      <Locate panTo={panTo} onCenter={setCenter}/> 
      <Search panTo={panTo} onCenter={setCenter} />

      <GoogleMap
        id="map"
        mapContainerStyle={mapContainerStyle}
        zoom={13}
        center={center}
        options={options}
        onLoad={onMapLoad}
        >
        { myPlaces && 
          myPlaces.map((myPlace)=>
          <Marker 
            key={myPlace.place_id} 
            position={{ lat: myPlace.geometry.location.lat, lng: myPlace.geometry.location.lng }} 
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
    </div>
  );
}

/////////////////////////////////////////////////////////
//       User Location  using Geolocation             //
////////////////////////////////////////////////////////

function Locate({ panTo, onCenter }) {
  return (
    <button
      className="locate"
      onClick={() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            panTo({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            onCenter({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
          },
          () => null
        );
      }}
    >
      <img src="/geolocation.svg" alt="geolocation" />
    </button>
  );
}

/////////////////////////////////////////////////////////
//       Destination search using autocomplete        //
////////////////////////////////////////////////////////
function Search({ panTo, onCenter }) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleInput = (e) => {
    // Update the keyword of the input element
    setValue(e.target.value);
  };

  const handleSelect = async (address) => {
    // When user selects a place, we can replace the keyword without request data from API
    // by setting the second parameter as "false"
    setValue(address, false); // no more fetching by setting false
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      console.log(results[0])
      const { lat, lng } = await getLatLng(results[0]);
      onCenter({
        lat, lng
      })
      panTo({ lat, lng });
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  return (
    <div className="search">
      <Combobox onSelect={handleSelect}>
        <ComboboxInput
          value={value}
          onChange={handleInput}
          disabled={!ready}
          placeholder="Your Destination"
        />
        <ComboboxPopover>
          <ComboboxList>
            {status === "OK" &&
              data.map(({ id, description }) => (
                <ComboboxOption key={id} value={description} />
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}
