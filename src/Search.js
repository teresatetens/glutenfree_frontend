import React from 'react'
import usePlacesAutocomplete, { getGeocode, getLatLng }  from "use-places-autocomplete";
import {Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption} from "@reach/combobox";
import "@reach/combobox/styles.css";

const Search = ({panTo, onCenter}) => {
    
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
            <Combobox onSelect={handleSelect} >
                <ComboboxInput
                    value={value}
                    onChange={handleInput}
                    disabled={!ready}
                    placeholder="Your Destination"
                    style={{border:'1px solid #4fbac0', outline:'none', zIndex:100 }}
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


export default Search
