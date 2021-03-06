import React, { Component } from 'react';
import { Pagination } from 'react-bootstrap';
import { GameTable } from './GameTable';
import { Graph } from './Graph';
import { Links } from './Links';
import { fetchScores } from '../../helpers/fetchScores';

export default class GameProfileContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loadingData: false,
      filteredGames: [],
      gameName: this.props.location.pathname.split('/')[2],
      activePage: 1,
      profile: this.props.profile
    }
    this.getHeader = this.getHeader.bind(this)
    this.handleSelect = this.handleSelect.bind(this)
    this.paginateScores = this.paginateScores.bind(this)
    this.getItemsAmount = this.getItemsAmount.bind(this)
    this.changeGameView = this.changeGameView.bind(this)
  }

  componentWillMount() {
    this.setState({loadingData: true});
    fetchScores(this.state.profile.email)
      .then(data => {
        data.json()
          .then(scores => {
            var sorted = this.getSortedScores(scores);
            this.setState({filteredGames: sorted, loadingData: false});
          })
      })
      .catch(error => this.setState({loadingData: false}))
  }

  getSortedScores(scores) {
    var filteredGames = scores.filter(game => game.gameName === this.state.gameName)
    return filteredGames.sort((a,b) => {
      return new Date(b.date) - new Date(a.date)
    });
  }

  getHeader() {
    return `${this.props.profile.given_name}'s ${this.state.gameName} Stats`;
  }

  handleSelect(eventKey) {
    this.setState({
      activePage: eventKey
    })
  }

  paginateScores() {
    var currentPage = this.state.activePage - 1;
    var startingIdx = currentPage * 5;
    var endingIdx = currentPage * 5 + 5;
    return this.state.filteredGames.slice(startingIdx, endingIdx);
  }

  getItemsAmount() {
    return Math.ceil(this.state.filteredGames.length/5);
  }

  changeGameView(game) {
    this.setState({loadingData: true, gameName: game})
    fetchScores(this.state.profile.email)
      .then(data => {
        data.json()
          .then(scores => {
            var sorted = this.getSortedScores(scores);
            this.setState({filteredGames: sorted, loadingData: false});
          })
      })
      .catch(error => this.setState({loadingData: false}))
  }

  render() {
    if (this.state.loadingData) {
      return <img className='center-block' src='/assets/img/loading.gif' />
    } else {
      return (
        <div className='center-block'>
          <Links onGameChange={this.changeGameView}/>
          <h1>{this.getHeader()}</h1>
          <p>Total {this.state.gameName} games played: {this.state.filteredGames.length}</p>
          <GameTable
            gameName={this.state.gameName}
            filteredGames={this.paginateScores()}
          />
          <Pagination
            first
            last
            ellipsis
            boundaryLinks
            bsSize='medium'
            items={this.getItemsAmount()}
            maxButtons={10}
            activePage={this.state.activePage}
            onSelect={this.handleSelect}
          />
          <Graph filteredGames={this.paginateScores()} />
        </div>
      )
    }
  }
}
