import React from "react";

import { motion, AnimatePresence } from "framer-motion";
import pkceChallenge from "pkce-challenge";

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
    player : Player | undefined,
    token : {
        access  : string,
        refresh : string,
    } | undefined,
    auth : {
        code          : string,
        code_verifier : string,
    } | undefined,
}

export class Spotify extends React.PureComponent<{}, SpotifyState> {
    private access_token_key  = "spotify-access_token";
    private code_verifier_key = "spotify-code_verifier";
    private refresh_token_key = "spotify-refresh_token";

    constructor(props: {}) {
        super(props);

        this.state = {
            auth   : undefined,
            player : undefined,
            token  : undefined,
        }

        if (window.location.search.startsWith("?spotify")) {
            const search = window.location.search.slice(1);

            const searchParsed = search.split("&").reduce((previous: any, current) => {
                const key = current.split("=")[0];
                const value = current.split("=")[1];

                previous[key] = value;

                return previous;
            }, {});

            const code = searchParsed.code;
            const code_verifier = window.localStorage.getItem(this.code_verifier_key);

            window.localStorage.removeItem(this.code_verifier_key);

            if (!code_verifier) {
                throw new Error("No code verifier");
            }

            this.state = {
                ...this.state,
                auth: {
                    code,
                    code_verifier,
                }
            }

            history.replaceState(null, "", window.location.origin + window.location.pathname);
        } else {
            const access  = window.localStorage.getItem(this.access_token_key);
            const refresh = window.localStorage.getItem(this.refresh_token_key);

            if (access && refresh) {
                this.state = {
                    ...this.state,
                    token: {
                        access,
                        refresh,
                    }
                };
            }
        }
    }

    private api = async () => {
        if (!this.state.token) {
            return;
        }

        try {
            const request = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
                headers: {
                    "Authorization" : `Bearer ${ this.state.token.access }`,
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
                window.localStorage.removeItem(this.access_token_key);
                window.localStorage.removeItem(this.refresh_token_key);

                this.setState({
                    token: undefined
                });
            }
        }
    }

    private readonly getAuth = () => {
        const challenge = pkceChallenge(128);

        const {
            code_challenge,
            code_verifier,
        } = challenge;

        window.localStorage.setItem(this.code_verifier_key, code_verifier);

        const client_id             = config.spotify.clientID;
        const code_challenge_method = "S256";
        const redirect_uri          = window.location.href + "?spotify";
        const response_type         = "code";

        const scope = [
            "user-read-currently-playing",
            "user-read-playback-state",
        ];

        window.location.assign(`https://accounts.spotify.com/en/authorize?client_id=${ client_id }&response_type=${ response_type }&redirect_uri=${ redirect_uri }&code_challenge_method=${ code_challenge_method }&code_challenge=${ code_challenge }&scope=${ scope.join(",") }`);
    }

    private readonly getTokens = async() => {
        if (!this.state.auth) {
            throw new Error("No auth");
        }

        const data = {
            client_id     : config.spotify.clientID,
            grant_type    : "authorization_code",
            code          : this.state.auth.code,
            redirect_uri  : window.location.href + "?spotify",
            code_verifier : this.state.auth.code_verifier
        }

        const request = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(data),
        });

        const response = await request.json();

        this.setState({
            auth: undefined,
            token: {
                access  : response.access_token,
                refresh : response.refresh_token,
            }
        })

        window.localStorage.setItem(this.access_token_key,  response.access_token);
        window.localStorage.setItem(this.refresh_token_key, response.refresh_token);
    }

    private readonly refreshTokens = async() => {
        if (!this.state.token) {
            throw new Error("No tokens");
        }

        const data = {
            client_id     : config.spotify.clientID,
            grant_type    : "refresh_token",
            refresh_token : this.state.token.refresh,
        }

        const request = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(data),
        });

        const response = await request.json();

        this.setState({
            auth: undefined,
            token: {
                access  : response.access_token,
                refresh : response.refresh_token,
            }
        })

        window.localStorage.setItem(this.access_token_key,  response.access_token);
        window.localStorage.setItem(this.refresh_token_key, response.refresh_token);
    }

    private readonly getData = async() => {
        const player = await this.api();

        if (player) {
            this.setState({ player });
        }
    }

    private getArtists(artists: { name: string }[]) {
        return artists.map((artist) => artist.name).join(", ");
    }

    componentDidMount() {
        if (this.state.auth) {
            this.getTokens();
        }

        this.getData();

        setInterval(() => {
            this.getData();
        }, 1_000);

        setInterval(() => {
            this.refreshTokens();
        }, 60_000 * 30); // 30 minutes
    }

    render() {
        const { token, player } = this.state;

        if (!token) {
            return (
                <div className="spotify">
                    <button className="spotify--login" onClick={ this.getAuth }>Spotify login</button>
                </div>
            )
        }

        if (!player)
            return null;

        const variants = {
            hidden  : { opacity: 0, y: "-100%" },
            visible : { opacity: 1, y: 0 },
        }

        return (
            <div className="spotify">
                <AnimatePresence>
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
                </AnimatePresence>
            </div>
        )
    }
}
