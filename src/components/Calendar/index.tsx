import React from "react";

import { DateTime } from "luxon";

import { Event } from "@components/Event";

import "./style.css";

type CalendarState = {
    events: gapi.client.calendar.Event[],
}

export class Calendar extends React.PureComponent<{}, CalendarState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            events: [],
        }

        // const colors = (await gapi.client.calendar.colors.get()).result;

        // console.log(colors);
    }

    private async getData() {
        const calendars = (await gapi.client.calendar.calendarList.list()).result.items || [];

        const time = DateTime.now();

        const timeMin = time.startOf("day").toISO();
        const timeMax = time.endOf("day").toISO();

        const calendarsEvents = calendars.map(async(calendar) => {
            if (!calendar.id)
                throw new Error;

            const events = (await gapi.client.calendar.events.list({
                calendarId: calendar.id,
                timeMin,
                timeMax,
            })).result.items || [];

            return events.map((_) => { return { ..._, color: calendar.backgroundColor || "" }});
        });

        const events = (await Promise.all(calendarsEvents)).flat();

        this.setState({
            events,
        });
    }

    componentDidMount() {
        this.getData();

        setInterval(() => {
            this.getData();
        }, 60_000);
    }

    render() {
        // console.log(this.state.events);

        if (!this.state.events.length) { return (<></>) };

        return (
            <div className="calendar">
                <div className="calendar--container">
                    <img src="./assets/GoogleCalendar.svg" alt="Calendar" className="calendar--logo" />

                    Aujourd'hui :

                    { this.state.events.map(event => <Event key={ event.id } { ...event } />) }
                </div>
            </div>
        )
    }
}
