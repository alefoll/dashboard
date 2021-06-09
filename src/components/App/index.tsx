import React from "react";

import { Google } from "@components/Google";
import { Spotify } from "@components/Spotify";
import { Time } from "@components/Time";
import { Twitch } from "@components/Twitch";

import "./style.css";


export class App extends React.PureComponent {
    render() {
        return (
            <main className="app">
                <Google />
                <Spotify />
                <Time />
                <Twitch />
            </main>
        );
    }
}
