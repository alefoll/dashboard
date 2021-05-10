import React from "react";

import { DateTime, Settings } from "luxon";

import "./style.css";

type TimeState = {
    date: string,
    time: string,
}

export class Time extends React.PureComponent<{}, TimeState> {
    constructor(props: {}) {
        super(props);

        Settings.defaultLocale = "fr";

        this.state = this.getDateTime();
    }

    componentDidMount() {
        this.refresh();
    }

    private getDateTime = (): TimeState => {
        const dateTime = DateTime.now();

        return {
            // https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
            date: dateTime.toFormat("cccc dd LLLL yyyy"),
            time: dateTime.toFormat("HH:mm:ss"),
        }
    }

    private refresh = () => {
        this.setState(this.getDateTime());

        setTimeout(this.refresh, 500);
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
                </div>
            </div>
        )
    }
}
