import { DateTime } from "luxon";
import React from "react";

import { Line } from 'react-chartjs-2';

import "./style.css";

interface FitnessState {
    // data: { time: number, value: number }[],
    data: any,
}

export class Fitness extends React.PureComponent<{}, FitnessState> {
    private options = {
        events: [],
        maintainAspectRatio: false,
        responsive: false,
        plugins: {
            legend: {
                display: false,
            }
        },
        scales: {
            y: {
                grid: {
                    color: "#3E3E40",
                }
            },
            x: {
                grid: {
                    display: false,
                }
            },
        }
    }

    constructor(props: {}) {
        super(props);

        this.state = {
            data: undefined,
        }
    }

    async componentDidMount() {
        const endDate   = DateTime.now();
        const startDate = endDate.minus({ month: 6 });

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


        console.log(values);

        this.setState({
            data: {
                labels,
                datasets: [{
                    data: values,
                    fill: false,
                    backgroundColor: '#80BFEA',
                    borderColor: '#80BFEA',
                    tension: 0.4,
                }],
            },
        });
    }

    render() {
        if (!this.state.data)
            return null;

        return (
            <div className="fitness">
                <Line type="line" height={ 320 } width={ 1920 } data={ this.state.data } options={ this.options } />
            </div>
        );
    }
}
