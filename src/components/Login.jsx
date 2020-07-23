import React from "react";
import { LocationsContext } from "../context/LocationsContext";

class Login extends React.Component {
  static contextType = LocationsContext
  state = { email: "", password: "", errMessage: "" };

  onInputChange = (event) => {
    const key = event.target.id;
    this.setState({
      [key]: event.target.value,
    });
  };

  onFormSubmit = async (event) => {
    event.preventDefault();
    const { email, password } = this.state;
    const body = {
      auth: { email, password },
    };
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (response.status >= 400) {
        throw new Error("incorrect credentials");
      } else {
        const { jwt } = await response.json();
        localStorage.setItem("token", jwt);
        this.setCurrentUser()
        this.props.history.push("/main");
      }
    } catch (err) {
      this.setState({
        errMessage: err.message,
      });
    }
  };

  setCurrentUser = async () =>{
    const response_user = await fetch(`${process.env.REACT_APP_BACKEND_URL}/status/user`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
        });
        const { user }= await response_user.json()
        sessionStorage.setItem('currentUser', user);
        this.context.dispatch("current user", user)
  }

  render() {
    const { email, password, errMessage } = this.state;
    return (
      <div className="container">
        <h1>Login</h1>
        {errMessage && <span>{errMessage}</span>}
        <form onSubmit={this.onFormSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={this.onInputChange}
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={this.onInputChange}
          />
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

export default Login;

