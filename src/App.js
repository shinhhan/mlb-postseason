import React, {Component} from 'react';
import logo from './logo.svg';
import './App.scss';

class App extends Component {
    constructor(props) {
        super(props);
        this.formattedData = '';
        this.allGames = [];
        this.scheduleUrl = 'http://statsapi.mlb.com/api/v1/schedule/postseason/series?sportId=1&season=2018&hydrate=team,broadcasts(all),seriesStatus(useOverride=true),decisions,person,probablePitcher,linescore(matchup)';

        this.state = {
            isLoaded : false
        };
    }

    componentWillMount() {
        this._getPostseasonData();
    }

    /**
     * fetches the data and passes to parseData method
     * @return {Object} data
     */
    _getPostseasonData() {
        fetch(this.scheduleUrl)
            .then((data) => {
                return data.json();
            })
            .then((data) => {
                return this._parseData(data);
            })
            .catch((errorData) => {
                console.log(JSON.stringify(errorData));
            });
    }

    /**
     * takes the data returned from the server and formats as needed
     * @param  {Object} data - and object containing the data to be formatted
     * @return {Object} formatted data
     */
    _parseData(data) {
        this.formattedData = this._sortByDate(data.series);

        this.setState({
            isLoaded : true
        })
    }

    /**
     * sort data by date
     * @param  {Object} data - data object to sort
     * @return {Object} data sorted by date
     */
    _sortByDate(data){
        data.forEach((series) => {
            series.games.forEach((game) => {
                this.allGames.push(game);
            });
        });

        return this.allGames.sort((a, b) => {
            a = new Date(a.gameDate);
            b = new Date(b.gameDate);

            return a > b ? 1 : a < b ? -1 : 0;
        });
    }

    /**
     * parse the broadcast data to get TV, en, home only
     * @param  {Object} data - broadcast data object
     * @return {String} render
     */
    _getBroadcastName(broadcasts) {
        let broadcastName       = null,
            broadcastId         = null;

        return broadcasts.map((broadcast, i) => {
            if (broadcast.type === 'TV' && broadcastId !== broadcast.id && broadcast.language === 'en' && broadcast.homeAway === 'home') {
                broadcastId = broadcast.id;
                broadcastName = broadcast.name;

                if (broadcastName.indexOf('-INT') === -1) {
                    return (
                        <img key={i} alt="broadcast-icon" className="broadcast-icon" src={'https://prod-gameday.mlbstatic.com/responsive-gameday-assets/1.2.0/images/tv_station/2018/' + broadcast.id + '.svg'} />
                    );
                }
            }
            return null;
        });
    }

    /**
     * loop through this.formattedData to render each game details
     * @return {String} render
     */
    _renderGames() {
        let dateArray = [],
            duplicateDateArray = [],
            rootUrl = 'https://www.mlb.com/';

        if (this.state.isLoaded) {
            return this.formattedData.map((game, i) => {
                let year = new Date(game.gameDate).getFullYear(),
                    fullDate = new Date(game.gameDate).toUTCString().split(' ', 4).join(' '),
                    date = fullDate.split(year)[0];

                if (!dateArray.includes(date)) {
                    dateArray.push(date);
                } else {
                    duplicateDateArray.push(date);
                }

                return (
                    <section key={i} className="game">
                        {duplicateDateArray.includes(date) ? null :  <div className="game__date">{date}</div>}
                        <span className="game__summary">{game.seriesStatus.shortDescription} - {game.seriesStatus.result}</span>
                        <div className="game__details">
                            <div>
                                <div className="game__details-teams">
                                    <a href={rootUrl + game.teams.away.team.teamName.toLowerCase()}>
                                        <img alt={game.teams.away.team.teamName} className="game__team-logo" src={'https://www.mlbstatic.com/team-logos/' + game.teams.away.team.id + '.svg'} />
                                        <span className="game__team-name">{game.teams.away.team.teamName}</span>
                                        <span className="game__score">{game.teams.away.score}</span>
                                    </a>
                                    <span className="at-icon">@</span>
                                    <a href={rootUrl + game.teams.home.team.teamName.toLowerCase()}>
                                        <img alt={game.teams.home.team.teamName} className="game__team-logo" src={'https://www.mlbstatic.com/team-logos/' + game.teams.home.team.id + '.svg'} />
                                        <span className="game__team-name">{game.teams.home.team.teamName}</span>
                                        <span className="game__score">{game.teams.home.score}</span>
                                    </a>
                                </div>
                                <div className="game__details-broadcast">
                                    <a href={rootUrl + '/gameday/' + game.gamePk}>{game.linescore.currentInning > 9 ? 'F/' + game.linescore.currentInning : 'FINAL'}</a>
                                    <span>{this._getBroadcastName(game.broadcasts)}</span>
                                </div>
                            </div>
                            <div>
                                <div className="game__details-players">
                                    <span>W: <a href={rootUrl + '/player/' + game.decisions.winner.nameSlug}>{game.decisions.winner.initLastName} </a></span>
                                    <span>L: <a href={rootUrl + '/player/' + game.decisions.loser.nameSlug}>{game.decisions.loser.initLastName} </a></span>
                                    {game.decisions.save ? <span>SV: <a href={rootUrl + '/player/' + game.decisions.save.nameSlug}>{game.decisions.save.initLastName}</a></span> : null}
                                </div>
                                <div className="game__details-ctas">
                                    <a href={rootUrl + '/gameday/' + game.gamePk + '/final/wrap'}>
                                        <span className="icon-newpaper"></span>
                                        <span className="copy">Wrap</span>
                                    </a>
                                    <a href={rootUrl + '/gameday/' + game.gamePk + '/final/video'}>
                                        <span className="icon-video"></span>
                                        <span className="copy">Video</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                );
            });
        }
    }

    render() {
        return (
            <div className="App">
                <header className="header">
                    <img alt="Major League Baseball logo" src={logo} className="logo" />
                    <h2>MLB 2018 Postseason Schedule</h2>
                </header>
                {this._renderGames()}
            </div>
        );
    }
}

export default App;
