import React from "react";

import "./style.css";

interface EventProps extends gapi.client.calendar.Event {
    color?: string,
}

export class Event extends React.PureComponent<EventProps, {}> {
    render() {
        // console.log(this.props);

        const style: React.CSSProperties = {
            color: this.props.color,
        }

        return (
            <div className="event" style={ style }>
                { this.props.summary }
            </div>
        )
    }
}
