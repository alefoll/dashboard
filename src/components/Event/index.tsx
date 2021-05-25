import React from "react";

import { DateTime } from "luxon";

import "./style.css";

interface EventProps extends gapi.client.calendar.Event {
    color?: string,
}

export class Event extends React.PureComponent<EventProps, {}> {
    private readonly duration?: string;

    constructor(props: {}) {
        super(props);

        const {
            end,
            start,
        } = this.props;

        if (start?.dateTime && end?.dateTime) {
            this.duration = `De ${ this.getTime(start.dateTime) } à ${ this.getTime(end.dateTime) }`;
        }
    }

    private getTime(dateTime: string) {
        const time = DateTime.fromISO(dateTime);

        const { hour, minute } = time.toObject();

        return `${ hour }h${ minute !== 0 ? minute : '' }`;
    }

    render() {
        // console.log(this.props);

        const {
            color,
            summary,
        } = this.props;

        const style: React.CSSProperties = {
            backgroundColor: color,
        };

        return (
            <div className="event">
                <div className={ this.duration ? "event--line" : "event--dot" } style={ style }></div>

                <div className="event--content">
                    <div className="event--content__summary">{ summary }</div>
                    { this.duration &&
                        <div className="event--content__duration">{ this.duration }</div>
                    }
                </div>
            </div>
        )
    }
}
