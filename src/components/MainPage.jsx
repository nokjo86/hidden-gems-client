import React from "react";
import { LocationsContext, dispatch } from "../context/LocationsContext";
import { Link } from "react-router-dom";
import MapContainer from './MapContainer';

class MainPage extends React.Component {
  static contextType = LocationsContext
  
  getLocations = async () => {
    try {
      const response = await fetch("http://localhost:3000/locations");
      const locations = await response.json();
      this.context.dispatch("populate", { locations })
    } catch (err) {
        console.log(err)
    }
  }

  async componentDidMount() {
    await this.getLocations()
  }

  setLoading = () => this.setState({ loading: false });

  static contextType = LocationsContext;
  render() {
    const { locations } = this.context;
    return locations && (
      <div className="MainPage">
        <MapContainer locations={locations}/>
      {locations.map((location, index) => {
        return (<div key={index}><Link to={{
          pathname: `/location/${location.id}`,
          state: location,
        }}>{location.name}</Link></div>)
      })}
    </div>
    )  
  }
}

export default MainPage;
