import React from "react";

import { DateTime } from "luxon";

import { Event } from "@components/Event";

import "./style.css";

type CalendarState = {
    day: number,
    events: gapi.client.calendar.Event[],
}

export class Calendar extends React.PureComponent<{}, CalendarState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            day: 1,
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
            day: time.day,
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
                    <div className="calendar--logo">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="186 38 76 76">
                            <path fill="#fff" d="M244 56h-40v40h40V56z"/>
                            <path fill="#EA4335" d="M244 114l18-18h-18v18z"/>
                            <path fill="#FBBC04" d="M262 56h-18v40h18V56z"/>
                            <path fill="#34A853" d="M244 96h-40v18h40V96z"/>
                            <path fill="#188038" d="M186 96v12c0 3.315 2.685 6 6 6h12V96h-18z"/>
                            <path fill="#1967D2" d="M262 56V44c0-3.315-2.685-6-6-6h-12v18h18z"/>
                            <path fill="#4285F4" d="M244 38h-52c-3.315 0 -6 2.685-6 6v52h18V56h40V38z"/>
                            <text fill="#4285F4" x="224px" y="86px" textAnchor="middle">{ this.state.day }</text>
                        </svg>
                    </div>

                    { this.state.events.map(event => <Event key={ event.id } { ...event } />) }
                </div>
            </div>
        )
    }
}
