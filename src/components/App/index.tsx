import React from "react";

import { Google } from "@components/Google";
import { Time } from "@components/Time";
import { Twitch } from "@components/Twitch";

import "./style.css";


export class App extends React.PureComponent {
    render() {
        return (
            <main className="app">
                <Google />
                <Time />
                <Twitch />
            </main>
        );
    }
}
