import "./index.html";
import "./style.css";

import React from "react";
import ReactDOM from "react-dom";

import { App } from "@components/App";

import "../assets/favicon.png";
import "../assets/france.svg";
import "../assets/TwitchGlitchPurple.svg";

// @ts-expect-error
console.log(`[APP] Version ${ APP_VERSION }`);

ReactDOM.render((
    <App />
), document.querySelector("#app"));
