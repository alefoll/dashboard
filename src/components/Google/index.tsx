import React from "react";

import { Calendar } from "@components/Calendar";
import { Fitness } from "@components/Fitness";

import config from "../../../config.json";

import "./style.css";

interface GoogleState {
    loaded: boolean,
    GoogleAuth: undefined | gapi.auth2.GoogleAuth,
}

export class Google extends React.PureComponent<{}, GoogleState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            loaded: false,
            GoogleAuth: undefined,
        }
    }

    componentDidMount() {
        gapi.load("client", this.start);
    }

    private readonly refreshTokens = async() => {
        const GoogleAuth = this.state.GoogleAuth!;

        await GoogleAuth.currentUser.get().reloadAuthResponse();

        setTimeout(() => {
            this.refreshTokens();
        }, 60_000 * 60 * 24); // 1 day
    }

    private start = async() => {
        const scopes = [
            // Calendar
            "https://www.googleapis.com/auth/calendar.events.readonly",

            // Fitness
            "https://www.googleapis.com/auth/fitness.activity.read",
            "https://www.googleapis.com/auth/fitness.location.read",
            "https://www.googleapis.com/auth/fitness.body.read",
            "https://www.googleapis.com/auth/fitness.nutrition.read",
            "https://www.googleapis.com/auth/fitness.blood_pressure.read",
            "https://www.googleapis.com/auth/fitness.blood_glucose.read",
            "https://www.googleapis.com/auth/fitness.oxygen_saturation.read",
            "https://www.googleapis.com/auth/fitness.body_temperature.read",
            "https://www.googleapis.com/auth/fitness.reproductive_health.read",
        ]

        await gapi.client.init({
            clientId      : config.google.clientID,
            discoveryDocs : [
                "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
                "https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest"
            ],
            scope : scopes.join(" "),
        });

        const GoogleAuth = gapi.auth2.getAuthInstance();

        this.setState({
            loaded: true,
            GoogleAuth,
        });

        if (!GoogleAuth.isSignedIn.get()) {
            await GoogleAuth.signIn({
                ux_mode: "redirect",
            });
        }

        setTimeout(() => {
            this.refreshTokens();
        }, 60_000 * 60 * 24); // 1 day
    }

    render() {
        if (!this.state.loaded)
            return null;

        return (
            <>
                <Calendar />
                <Fitness />
            </>
        );
    }
}
