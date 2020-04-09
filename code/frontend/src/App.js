import React, { Component } from 'react';
import SignUp from './Views/SignUp';
import socketIOClient from 'socket.io-client';

class App extends Component {
  state = {
    strTodoDescription: '',
    strTitle: '',
    strDueDate: new Date(),
    leaderboard: [],
  };

  componentDidMount() {
    const socket = socketIOClient('http://localhost:9000');
    socket.on('leaderboard', (data) => this.setState({ leaderboard: data }));
  }

  handleChange = (strValue) => {
    this.setState({
      strTodoDescription: strValue,
    });
  };
  handleTitleChange = (strValue) => {
    this.setState({
      strTitle: strValue,
    });
  };
  handleSubmit = (e) => {
    const token = localStorage.getItem('authToken');
    e.preventDefault();
    fetch('http://localhost:9000/todo', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: this.state.strTitle,
        description: this.state.strTodoDescription,
        dueDate: this.state.strDueDate.toISOString().split('T')[0],
      }),
    });
  };
  render() {
    return (
      <>
        {/* <form>
          <label>name</label>
          <input onChange={e => this.handleTitleChange(e.target.value)} value={this.state.strTodoTitle}></input>
          <input onChange={e => this.handleChange(e.target.value)} value={this.state.strTodoDescription}></input>
          <button onClick={this.handleSubmit}>Submit</button>
        </form>
         */}
        <SignUp />
        {/* {<p>{JSON.stringify(this.state.leaderboard)}</p>} */}
        {this.state.leaderboard.length !== 0 &&
          this.state.leaderboard.map((entry) => (
            <>
              <div>
                <strong>{entry.username}</strong>
              </div>
              <div>
                <p>Total</p>
                <li> Points:{entry.totalPoints}</li>
                <li> Todos:{entry.totalCompletedTodos}</li>
                <p>Today</p>
                <li> Points:{entry.todayPoints}</li>
                <li> Todos:{entry.todosCompletedToday}</li>
              </div>
            </>
          ))}
      </>
    );
  }
}

//TODO Use Yup for client side validation

export default App;
