import React from "react";

import { DateTime, Settings } from "luxon";

import "./style.css";

type TimeState = {
    date: string,
    time: string,
    timeFrance: string,
}

export class Time extends React.PureComponent<{}, TimeState> {
    constructor(props: {}) {
        super(props);

        Settings.defaultLocale = "fr";

        this.state = this.getDateTime();
    }

    private getDateTime = (): TimeState => {
        const dateTime = DateTime.now();
        const dateTimeFrance = dateTime.setZone("Europe/Paris");

        return {
            // https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
            date: dateTime.toFormat("cccc dd LLLL"),
            time: dateTime.toFormat("HH:mm:ss"),
            timeFrance: dateTimeFrance.toFormat("HH:mm:ss"),
        }
    }

    componentDidMount() {
        setInterval(() => {
            this.setState(this.getDateTime());
        }, 500);
    }

    render() {
        return (
            <div className="time">
                <div className="time--container">
                    <div className="time--container__date">
                        { this.state.date }
                    </div>

                    <div className="time--container__time">
                        { this.state.time }
                    </div>

                    <div className="time-france time--container">
                        <div className="time--container__time">
                            <img src="./assets/france.svg" alt="France" className="france-icon" />
                            { this.state.timeFrance }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
