import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import styled from "styled-components";
import {
    AskSelectBitrate,
    AskSelectDisplay,
    AskSelectFramerate,
    AskSelectSoundcard,
    TurnOnAlert,
    TurnOnStatus,
} from "../components/popup/popup";
import { WebRTCClient } from "webrtc-streaming-core/dist/app";
import { useRouter } from "next/router";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import { List, Fullscreen } from "@mui/icons-material";
import Draggable from "react-draggable";
import {
    DeviceSelection,
    DeviceSelectionResult,
} from "webrtc-streaming-core/dist/models/devices.model";
import {
    ConnectionEvent,
    Log,
    LogConnectionEvent,
    LogLevel,
} from "webrtc-streaming-core/dist/utils/log";
import { GetServerSideProps } from "next";
import { Joystick } from "react-joystick-component";
import { IJoystickUpdateEvent } from "react-joystick-component/build/lib/Joystick";
import { GoogleAnalytics } from "nextjs-google-analytics";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import {
    ButtonGroup,
    VirtualGamepad,
} from "../components/virtGamepad/virtGamepad";
import { WebRTCControl } from "../components/control/control";
import DPad from "../components/gamepad/d_pad";
import YBXA from "../components/gamepad/y_b_x_a";

type Props = { host: string | null };

export const getServerSideProps: GetServerSideProps<Props> = async (
    context
) => ({ props: { host: context.req.headers.host || null } });

const buttons = [
    <Button key="one">One</Button>,
    <Button key="two">Two</Button>,
    <Button key="three">Three</Button>,
];

const Home = ({ host }) => {
    const remoteVideo = useRef<HTMLVideoElement>(null);
    const remoteAudio = useRef<HTMLAudioElement>(null);

    const router = useRouter();
    const { signaling, token, fps, bitrate } = router.query;
    const signalingURL = Buffer.from(
        (signaling
            ? signaling
            : "d3NzOi8vc2VydmljZS50aGlua21heS5uZXQvaGFuZHNoYWtl") as string,
        "base64"
    ).toString();
    const signalingToken = (token ? token : "none") as string;
    var defaultBitrate = parseInt((bitrate ? bitrate : "6000") as string, 10);
    var defaultFramerate = parseInt((fps ? fps : "55") as string, 10);
    var defaultSoundcard = "Default Audio Render Device";

    let client: WebRTCClient;
    useEffect(() => {
        client =
            client != null
                ? client
                : new WebRTCClient(
                      signalingURL,
                      remoteVideo,
                      remoteAudio,
                      signalingToken,
                      async (offer: DeviceSelection) => {
                          LogConnectionEvent(
                              ConnectionEvent.WaitingAvailableDeviceSelection
                          );

                          let ret = new DeviceSelectionResult(
                              offer.soundcards[0].DeviceID,
                              offer.monitors[0].MonitorHandle.toString()
                          );
                          if (offer.soundcards.length > 1) {
                              let exist = false;
                              if (defaultSoundcard != null) {
                                  offer.soundcards.forEach((x) => {
                                      if (x.Name == defaultSoundcard) {
                                          exist = true;
                                          ret.SoundcardDeviceID = x.DeviceID;
                                          defaultSoundcard = null;
                                      }
                                  });
                              }

                              if (!exist) {
                                  ret.SoundcardDeviceID =
                                      await AskSelectSoundcard(
                                          offer.soundcards
                                      );
                                  Log(
                                      LogLevel.Infor,
                                      `selected audio deviceid ${ret.SoundcardDeviceID}`
                                  );
                              }
                          }

                          if (offer.monitors.length > 1) {
                              ret.MonitorHandle = await AskSelectDisplay(
                                  offer.monitors
                              );
                              Log(
                                  LogLevel.Infor,
                                  `selected monitor handle ${ret.MonitorHandle}`
                              );
                          }

                          if (defaultBitrate == null) {
                              ret.bitrate = await AskSelectBitrate();
                          } else {
                              ret.bitrate = defaultBitrate;
                          }
                          if (defaultFramerate == null) {
                              ret.framerate = await AskSelectFramerate();
                          } else {
                              ret.framerate = defaultFramerate;
                          }

                          return ret;
                      }
                  )
                      .Notifier((message) => {
                          console.log(message);
                          TurnOnStatus(message);
                      })
                      .Alert((message) => {
                          TurnOnAlert(message);
                      });
    }, []);

    return (
        <Body>
            <GoogleAnalytics trackPageViews />
            <Head>
                <title>WebRTC remote viewer</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
                ></meta>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <RemoteVideo
                ref={remoteVideo}
                autoPlay
                muted
                playsInline
                loop
            ></RemoteVideo>

            <App >
                <WebRTCControl></WebRTCControl>
            </App>
            <audio
                ref={remoteAudio}
                autoPlay
                controls
                style={{ zIndex: -5, opacity: 0 }}
            ></audio>
        </Body>
        // <>
        //   <DPad></DPad>
        // </>
    );
};

const RemoteVideo = styled.video`
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    margin: 0;
    width: 100%;
    height: 100%;
    max-height: 100%;
    max-width: 100%;
`;
const Body = styled.div`
    width: 100%;
    height: 100vh;
    padding: 0;
    margin: 0;
    border: 0;
    overflow: hidden;
    background-color: black;
`;
const App = styled.div`
    position: relative;
    width: 100vw;   
    height: 100vh;
`;
export default Home;
