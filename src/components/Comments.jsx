import React from "react";
import { LocationsContext } from "../context/LocationsContext";
import moment from "moment";
import { Button, Checkbox, Form } from "semantic-ui-react";
import "../stylesheets/Comments.scss";

class Comments extends React.Component {
  static contextType = LocationsContext;
  state = {
    comments: [],
    location_id: this.props.location_id,
    body: "",
    comment_id: null,
    create: true,
    disabled: "disabled",
  };

  componentWillReceiveProps = (nextProps) => {
    this.setNewState(nextProps);
  };
  setNewState = (props = this.props) => {
    this.setState({ ...props });
  };

  renderComments = (comments) => {
    let currentUser = sessionStorage.getItem("currentUser");
    if (comments.length === 0) {
      this.loadFromRails();
    } else if (comments[0] === 0) {
      return <p style={{ fontStyle: "italic" }}>No comment</p>;
    } else {
      return comments.map((comment, index) => {
        return (
          <div key={index}>
            <div>
              <i> {comment.username} </i>
              <small>wrote </small>
              <small>
                {moment(comment.created_at).startOf("minute").fromNow()}
              </small>
            </div>
            <span>{comment.body}</span>
            {comment.username === currentUser && (
              <>
                <small onClick={this.onClickEdit} id={comment.id}>
                  {" "}
                  Edit{" "}
                </small>
                <small> | </small>
                <small onClick={() => this.deleteComment(comment.id)}>
                  {" "}
                  Delete{" "}
                </small>
              </>
            )}
          </div>
        );
      });
    }
  };

  componentDidMount = () => {
    this.checkUser();
  };

  checkUser = () => {
    sessionStorage.getItem("currentUser") &&
      localStorage.getItem("token") &&
      this.setState({ disabled: "" });
  };
  onClickEdit = (e) => {
    this.setState({ create: false });
    this.getEditComment(e.target.id);
  };

  getEditComment = async (id) => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/locations/${this.state.location_id}/comments/${id}`
    );
    const comment = await response.json();
    this.setState({ body: comment.body, comment_id: comment.id });
  };

  getComments = async () => {
    const id = this.state.location_id;
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/locations/${id}/comments`
    );
    const comments = await response.json();
    if (comments.status >= 400) {
      this.state.history.push("/notfound");
    }
    this.setState({ comments: comments });
  };

  loadFromRails = () => {
    this.getComments();
  };

  onInputChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value,
    });
  };

  onFormSubmitCreate = async (event) => {
    event.preventDefault();
    const data = { body: this.state.body, location_id: this.state.location_id };
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/locations/${this.state.location_id}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      }
    );
    this.setState({ body: "", create: true });
    this.loadFromRails();
  };

  onFormSubmitEdit = async (event) => {
    event.preventDefault();
    const data = { body: this.state.body };
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/locations/${this.state.location_id}/comments/${this.state.comment_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      }
    );
    this.setState({ body: "", create: true });
    this.loadFromRails();
  };

  deleteComment = async (id) => {
    await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/locations/${this.state.location_id}/comments/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    this.loadFromRails();
  };

  render() {
    const formHidden = { display: "none" };
    return (
      <div className="comments">
        <p>Comments</p>
        {this.state.comments && this.renderComments(this.state.comments)}
        {this.state.create && (
          <>
            <Form
              style={this.state.disabled ? formHidden : null}
              onSubmit={this.onFormSubmitCreate}
            >
              <Form.Field>
                <label>Add Comment</label>
                <textarea
                  rows={4}
                  disabled={this.state.disabled}
                  onChange={this.onInputChange}
                  value={this.state.body}
                  id="body"
                />
              </Form.Field>
              <Button type="submit" disabled={this.state.disabled}>
                Submit
              </Button>
            </Form>
          </>
        )}
        {!this.state.create && (
          <>
            <Form onSubmit={this.onFormSubmitEdit}>
              <Form.Field>
                <label>Edit Comment</label>
                <textarea
                  rows={4}
                  onChange={this.onInputChange}
                  value={this.state.body}
                  id="body"
                />
              </Form.Field>
              <Button type="submit">Update</Button>
            </Form>
          </>
        )}
      </div>
    );
  }
}

export default Comments;
