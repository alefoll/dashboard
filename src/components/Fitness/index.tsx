import React from "react";

import { DateTime } from "luxon";
import { Line } from 'react-chartjs-2';

import "./style.css";

interface FitnessState {
    // data: { time: number, value: number }[],
    data: any,
}

export class Fitness extends React.Component<{}, FitnessState> {
    private options = {
        events: [],
        maintainAspectRatio: false,
        responsive: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                grid: {
                    borderDash: [10, 10],
                    color: "rgba(255, 255, 255, .8)",
                    tickWidth: 0,
                },
                ticks: {
                    color: "#ffffff",
                    font: {
                        family: "Product Sans",
                        size: 20,
                    },
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: "#ffffff",
                    autoSkipPadding: 36,
                    font: {
                        family: "Product Sans",
                        size: 20,
                    },
                },
            },
        },
    }

    constructor(props: {}) {
        super(props);

        this.state = {
            data: undefined,
        }
    }

    private async getData() {
        const endDate   = DateTime.now();
        const startDate = endDate.minus({ month: 4 });

        const format = "dd LLL";

        const labels: string[] = [];

        const numberLabel = endDate.diff(startDate, "days").toObject().days ?? 0;

        for (let index = 0; index < numberLabel; index++) {
            labels.push(startDate.plus({ days: index }).toFormat(format));
        }

        const result = (await gapi.client.fitness.users.dataSources.datasets.get({
            userId: "me",
            dataSourceId: "derived:com.google.weight:com.google.android.gms:merge_weight",
            datasetId: `${ startDate.toMillis() }000000-${ endDate.toMillis() }000000`,
        })).result.point;

        const values = result?.map((item) => {
            if (item.value?.length !== 1 || !item.startTimeNanos)
                return;

            const date = DateTime.fromMillis(parseInt(item.startTimeNanos.substr(0, 13)));

            return {
                x: date.toFormat(format),
                y: item.value[0].fpVal,
            }
        }) ?? [];

        this.setState({
            data: {
                labels,
                datasets: [{
                    data: values,
                    fill: false,
                    backgroundColor: "#80BFEA",
                    borderColor: "#80BFEA",
                    tension: 0.4,
                }],
            },
        });
    }

    componentDidMount() {
        this.getData();

        setInterval(() => {
            this.getData();
        }, 60_000);
    }

    shouldComponentUpdate(nextProps: {}, nextState: FitnessState) {
        return JSON.stringify(this.state.data) !== JSON.stringify(nextState.data);
    }

    render() {
        if (!this.state.data)
            return null;

        return (
            <div className="fitness">
                <Line type="line" height={ 350 } width={ 1920 } data={ this.state.data } options={ this.options } />
            </div>
        );
    }
}
