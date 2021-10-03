import React from "react";

import "./style.css";

export class Temp extends React.PureComponent {
    private readonly openDevice = async() => {
        const filters = [{ vendorId: 0x067b, productId: 0x2303 }];

        let device: USBDevice;

        try {
            device = await navigator.usb.requestDevice({
                filters
            });
        } catch(error) {
            throw new Error("There is no device. " + error);
        }


        try {
            await device.open();
            console.log("Opened");

            await device.selectConfiguration(1);
            console.log("Config");

            await device.claimInterface(0);
            console.log("Interface");

            const result = await device.transferIn(2, 64) // Waiting for 64 bytes of data from endpoint #2
            console.log("transferIn");

            console.log(result);
        } catch(error) {
            console.error("Error, Part time lover", error);
        } finally {
            console.log("Close device");
            await device.close();
            console.log("Device closed");
        }
    }

    render() {
        return (
            <div className="temp">
                <button onClick={ this.openDevice }>Thunder</button>
            </div>
        )
    }
}
