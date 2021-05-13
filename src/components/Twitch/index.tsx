import React from "react";

import { Settings } from "luxon";

import config from "../../../config.json";

import "./style.css";

type TwitchState = {
    streams: Stream[],
    token: string | undefined,
}

type User = {
    broadcaster_type: "partner" | "affiliate" | "",
    description: string,
    display_name: string,
    email?: string,
    id: string,
    login: string,
    offline_image_url: string,
    profile_image_url: string,
    type: "staff" | "admin" | "global_mod" | "",
    view_count: number,
    created_at: string,
    video_pagination?: string,
}

type UserFollow = {
    followed_at: string,
    from_id: string,
    from_name: string,
    to_id: string,
    to_name: string,
}

type Stream = {
    game_id: string;
    game_name: string;
    id: string;
    is_mature: boolean;
    language: string;
    started_at: string;
    tag_ids: string[];
    thumbnail_url: string;
    title: string;
    user_id: string;
    user_login: string;
    user_name: string;
    viewer_count: number;
}

export class Twitch extends React.PureComponent<{}, TwitchState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            streams: [],
            token: undefined,
        }

        Settings.defaultLocale = "fr";

        let token = window.localStorage.getItem("token");

        if (window.location.hash.length) {
            const hash = window.location.hash.slice(1);

            const hashParsed = hash.split("&").reduce((previous: any, current) => {
                const key = current.split("=")[0];
                const value = current.split("=")[1];

                previous[key] = value;

                return previous;
            }, {});

            if (hashParsed.access_token != null) {
                token = hashParsed.access_token;

                window.localStorage.setItem("token", hashParsed.access_token);
            }

            window.location.hash = "";
        }

        if (token) {
            this.state = {
                ...this.state,
                token: token,
            };
        }
    }

    private api = async (path: string) => {
        try {
            const request = await fetch(`https://api.twitch.tv/helix/${ path }`, {
                headers: {
                    "Authorization" : `Bearer ${ this.state.token }`,
                    "Client-Id"     : config.twitch.clientID,
                }
            });

            if (request.status < 200 || request.status > 299) {
                throw "Request error";
            }

            return request.json();
        } catch (error) {
            if (error === "Request error") {
                window.localStorage.removeItem("token");

                this.setState({
                    token: undefined
                });
            }
        }
    }

    private readonly getStreams = async (userIDs: string[], pagination: string = ""): Promise<Stream[]> => {
        const request = await this.api(`streams?user_id=${ userIDs.slice(0, 100).join("&user_id=") }&after=${ pagination }`);

        const streams: Stream[] = request.data;

        if (request.pagination.cursor) {
            const recursive = await this.getStreams(userIDs.slice(100, 200), request.pagination.cursor);

            streams.push(...recursive);
        }

        return streams;
    }

    private readonly getUsers = async (userIDs: string[] = []): Promise<User[]> => {
        let query = "";


        if (userIDs.length) {
            query = "?id=" + userIDs.slice(0, 100).join("&id="); // API limit 100
        }

        const request = await this.api(`users${ query }`);

        return request.data;
    }

    private readonly getUserChannels = async (user: User, pagination: string = ""): Promise<UserFollow[]> => {
        const request = await this.api(`users/follows?from_id=${ user.id }&after=${ pagination }`);

        const result = request.data;

        if (request.pagination.cursor) {
            const recursive = await this.getUserChannels(user, request.pagination.cursor);

            result.push(...recursive);
        }

        return result;
    }


    componentDidMount() {
        this.refresh();

        setInterval(() => {
            this.refresh();
        }, 60_000);
    }

    private readonly refresh = async() => {
        const me = (await this.getUsers())[0];

        const userFollow = await this.getUserChannels(me);

        const userIDs = userFollow.map(follow => follow.to_id);

        const streams = await this.getStreams(userIDs);

        streams.sort((a, b) => b.viewer_count - a.viewer_count);

        this.setState({ streams });
    }

    private readonly getThumbnail = (url: string) => {
        return url.replace(/%?{width}x%?{height}/, "160x90");
    }

    private readonly format = (number: number) => {
        return new Intl.NumberFormat("en", {
            // @ts-expect-error
            notation: "compact",

        }).format(number);
    }

    render() {
        const { streams } = this.state;

        if (!streams.length) { return (<></>) };

        return (
            <div className="twitch">
                <img src="./assets/TwitchGlitchPurple.svg" alt="Twitch" className="twitch-logo" />

                { streams.map((stream) => {
                    return (
                        <div key={ stream.id } className="twitch--stream">
                            <div className="twitch--stream__pic">
                                <img src={ this.getThumbnail(stream.thumbnail_url) + "?" + Date.now() } alt={ stream.user_name } />
                            </div>

                            <div className="twitch--stream__container">
                                <div className="twitch--stream__info">
                                    <h2 className="twitch--stream__name">{ stream.user_name }</h2>
                                    <span className="twitch--stream__viewer">{ this.format(stream.viewer_count) }</span>
                                </div>

                                <h3 className="twitch--stream__game">{ stream.game_name }</h3>
                            </div>

                        </div>
                    );
                }) }
            </div>
        )
    }
}
