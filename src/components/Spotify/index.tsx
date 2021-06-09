import React from "react";

import { motion, AnimatePresence } from "framer-motion";

import config from "../../../config.json";

import "./style.css";

type Player = {
    is_playing  : boolean,
    progress_ms : number,
    item : {
        name        : string,
        duration_ms : number,
        album: {
            images: [{
                height : number,
                width  : number,
                url    : string,
            }],
        },
        artists: [{
            name: string,
        }],
    },
}

type SpotifyState = {
    token  : string | undefined,
    player : Player | undefined
}

export class Spotify extends React.PureComponent<{}, SpotifyState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            token  : undefined,
            player : undefined,
        }

        let token = window.localStorage.getItem("spotify-token");

        if (window.location.hash.length && window.location.search.startsWith("?spotify")) {
            const hash = window.location.hash.slice(1);

            const hashParsed = hash.split("&").reduce((previous: any, current) => {
                const key = current.split("=")[0];
                const value = current.split("=")[1];

                previous[key] = value;

                return previous;
            }, {});

            if (hashParsed.access_token != null) {
                token = hashParsed.access_token;

                window.localStorage.setItem("spotify-token", hashParsed.access_token);
            }

            history.replaceState(null, "", window.location.origin + window.location.pathname);
        }

        if (token) {
            this.state = {
                ...this.state,
                token: token,
            };
        }
    }


    private api = async () => {
        try {
            const request = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
                headers: {
                    "Authorization" : `Bearer ${ this.state.token }`,
                }
            });

            if (request.status < 200 || request.status > 299) {
                throw "Request error";
            }

            if (request.status === 200) {
                return request.json();
            }
        } catch (error) {
            if (error === "Request error") {
                window.localStorage.removeItem("spotify-token");

                this.setState({
                    token: undefined
                });
            }
        }
    }

    private readonly getToken = () => {
        window.location.assign(`https://accounts.spotify.com/en/authorize?response_type=token&client_id=${ config.spotify.clientID }&redirect_uri=${ window.location.href }?spotify&scope=user-read-currently-playing,user-read-playback-state&show_dialog=false`);
    }

    private readonly getData = async() => {
        const player = await this.api();

        if (player) {
            console.log(player);

            this.setState({ player });
        }
    }

    private getArtists(artists: { name: string }[]) {
        return artists.map((artist) => artist.name).join(", ");
    }

    componentDidMount() {
        if (this.state.token) {
            this.getData();

            setInterval(() => {
                this.getData();
            }, 1_000);
        }
    }

    render() {
        const { token, player } = this.state;

        const variants = {
            hidden  : { opacity: 0, y: "-100%" },
            visible : { opacity: 1, y: 0 },
        }

        return (
            <div className="spotify">
                { !token && <button className="spotify--login" onClick={ this.getToken }>Spotify login</button> }

                <AnimatePresence>
                    { player &&
                        <motion.div className="spotify--player" transition={{ duration: 0.3 }} initial="hidden" animate="visible" variants={ variants } exit={ variants.hidden }>
                            <div className="spotify--player__cover">
                                <img src={ player.item.album.images[0].url } alt={ this.getArtists(player.item.artists) } />
                            </div>

                            <div className="spotify--player__wrapper">
                                <div className="spotify--player__track">{ player.item.name }</div>
                                <div className="spotify--player__artists">{ this.getArtists(player.item.artists) }</div>
                                <div className="spotify--player__progress" style={{ width: ((player.progress_ms / player.item.duration_ms) * 100) + "%" }}></div>
                            </div>
                        </motion.div>
                    }
                </AnimatePresence>
            </div>
        )
    }
}
