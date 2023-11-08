"use client"
import Swal from "sweetalert2";
import 'sweetalert2/src/sweetalert2.scss'

let have_swal : 'confirm' | 'popup' | 'none' = "none";

export async function TurnOnAlert(error: string): Promise<void> {
    if (have_swal == 'popup') {
        TurnOffStatus();
        have_swal = 'none'
    } 

    if (have_swal == 'confirm') {
        return
    }


    have_swal = 'popup';
    Swal.fire({
        title: "Opps...",
        text: error,
        icon: "error",
        confirmButtonText: "OK",
    });
}

export async function TurnOnConfirm(status: string, text?: string): Promise<void> {
    while (have_swal == 'confirm') {
		await new Promise(r => setTimeout(r, 300));
    }

    if (have_swal == 'popup') {
        TurnOffStatus();
        have_swal = 'none'
    }


    have_swal = 'confirm'
    await Swal.fire({
        title: `${status}`,
        text: text ?? "Please click on screen to start",
        confirmButtonText: "START",
        showConfirmButton: true,
    });
    have_swal = 'none'
}
export function TurnOnStatus(status: string, text?: string): void {
    if (have_swal == 'popup') {
        TurnOffStatus();
    } 

    if (have_swal == 'confirm') {
        return
    }

    have_swal = 'popup';
    Swal.fire({
        title: `${status}`,
        text: text ?? "Please wait while the client is getting ready...",
        showConfirmButton: false,
        timer: 2000,
        willOpen: () => Swal.showLoading(null),
        willClose: () => Swal.hideLoading(),
    });
}

export function TurnOffStatus(): void {
    Swal.close();
}


export async function TurnOnClipboard(): Promise<string | null> {
    const { value: text } = await Swal.fire({
        input: 'textarea',
        inputLabel: 'Message',
        inputPlaceholder: 'Type your message here...',
        inputAttributes: {
            'aria-label': 'Type your message here'
        },
        showCancelButton: false
    })
    Swal.close();

    if (text) {
        return text
    } else {
        return null
    }
}


export async function AskSelectDisplay( monitors: string[]): Promise<{
        display:string,
        width:number,
        height:number,
        framerate:number,
    }> {

    TurnOffStatus();
    const swalInput = {};
    monitors.forEach(monitor => {
        //swalInput[x] = {}
        swalInput[`${monitor}|1920|1080|60`] = "FullHD 60fps"
        swalInput[`${monitor}|1920|1080|120`] = "FullHD 120fps"
        swalInput[`${monitor}|2560|1440|60`] = "2K 60fps"
        swalInput[`${monitor}|2560|1440|120`] = "2K 120fps"
        swalInput[`${monitor}|3840|2160|60`] = "4K 60fps"
        swalInput[`${monitor}|3840|2160|120`] = "4K 120fps"
    })

    const { value } = await Swal.fire({
        title: "Select monitor",
        input: "select",
        inputOptions: swalInput,
        inputPlaceholder: "Select monitor",
        showCancelButton: false,
        inputValidator: (value) => "" ,
    });

    if(!value) return
    return {
        display:              (value as string).split('|').at(0),
        width:       parseInt((value as string).split('|').at(1)),
        height:      parseInt((value as string).split('|').at(2)),
        framerate:   parseInt((value as string).split('|').at(3)),
    };
}


export async function AskSelectBitrate(): Promise<number> {
    TurnOffStatus();
    const { value: bitrate } = await Swal.fire({
        title: "Select bitrate",
        input: "select",
        inputOptions: {
            "500": "500 kbps",
            "1000": "1 mbps",
            "2000": "2 mbps",
            "3000": "3 mbps",
            "6000": "6 mbps",
            "8000": "8 mbps",
            "10000": "10 mbps",
             "20000": "20 mbps",
            //  "30000": "30 mbps",
            //  "40000": "40 mbps",
            // "60000": "60 mbps",
            // "80000": "80 mbps",
        },
        inputPlaceholder: "Select bitrate",
        showCancelButton: false,
        inputValidator: (value) => {
            return "";
        },
    });

    return Number.parseInt(bitrate);
}
