import "./index.html";
import "./style.css";

import React from "react";
import ReactDOM from "react-dom";

import { App } from "@components/App";

import "../assets/favicon.png";
import "../assets/france.svg";
import "../assets/TwitchGlitchPurple.svg";

ReactDOM.render((
    <App />
), document.querySelector("#app"));