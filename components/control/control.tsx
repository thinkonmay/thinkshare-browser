"use client"

import { Fullscreen, LockReset, } from "@mui/icons-material";
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import MouseOutlinedIcon from '@mui/icons-material/MouseOutlined';
import VideoSettingsOutlinedIcon from '@mui/icons-material/VideoSettingsOutlined';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import React, { useEffect, useState, createContext } from "react"; // we need this to make JSX compile
import { Platform } from "../../core/utils/platform";
import { requestFullscreen } from "../../core/utils/screen";
import { AskSelectBitrate, TurnOnClipboard } from "../popup/popup";
import { VirtualGamepad } from "../virtGamepad/virtGamepad";
import { VirtualMouse } from "../virtMouse/virtMouse";
import MobileControl from "./mobileControl";
import SettingsIcon from '@mui/icons-material/Settings';
import DesktopControl from "./desktopControl";
import Setting from "../setting/setting";


export type ButtonMode = "static" | "draggable" | "disable";

interface IControlContext {
	isSetVGamePadDefaultValue:boolean
	isSetVMouseDefaultValue:boolean
}
export const ConTrolContext = createContext<IControlContext | null>(null)


export const WebRTCControl = (input: {
	gamepad_callback_a: (x: number, y: number, type: 'left' | 'right') => Promise<void>,
	gamepad_callback_b: (index: number, type: 'up' | 'down') => Promise<void>,
	mouse_move_callback: (x: number, y: number) => Promise<void>,
	mouse_button_callback: (index: number, type: 'up' | 'down') => Promise<void>,
	keystuck_callback: () => Promise<void>,
	reset_callback: () => Promise<void>,
	clipboard_callback: (val: string) => Promise<void>,

	bitrate_callback: (bitrate: number) => Promise<void>,
	toggle_mouse_touch_callback: (enable: boolean) => Promise<void>,
	fullscreen_callback: () => Promise<void>,

	platform: Platform,
	video: HTMLVideoElement
}) => {
	const [enableVGamepad, setenableVGamepad] = useState<ButtonMode>("disable");
	const [enableVMouse, setenableVMouse] = useState<ButtonMode>("disable");
	const [actions, setactions] = useState<any[]>([]);
	const [isModalSettingOpen, setModalSettingOpen] = useState(false)

	useEffect(() => {
		let enable = (enableVGamepad == 'disable') && (enableVMouse   == 'disable')
		if( enableVGamepad == 'draggable' || enableVMouse =='draggable'){
			enable = false
		}
		input.toggle_mouse_touch_callback(enable);
		
	}, [enableVGamepad, enableVMouse])

	const handleDraggable = (type: 'VGamePad' | 'VMouse', value: boolean) => {

		setModalSettingOpen(false)
		if (type === 'VGamePad') {
			setenableVGamepad("draggable")
			setenableVMouse("disable")

		} else if (type === 'VMouse') {
			setenableVMouse("draggable")
			setenableVGamepad("disable")
		}

	}


	const [defaultPos, setDefaultPos] = useState()
	const [tempPos, setTempPos] = useState()
	const [isSetVGamePadDefaultValue, setVGamePadDefaultValue] = useState(false)
	const [isSetVMouseDefaultValue, setVMouseDefaultValue] = useState(false)

	const handleOkeyDragValue = async () => {
		if (enableVGamepad === 'draggable') 
			setenableVGamepad('static')
		else if (enableVMouse === 'draggable') 
			setenableVMouse('static')
	}

	const handleSetDeafaultDragValue = async () => {
		if(enableVGamepad ==='draggable')
			setVGamePadDefaultValue(true)
		else if(enableVMouse ==='draggable')
			setVMouseDefaultValue(true)
		
	}
	//reset per/click default
	useEffect(()=>{
		setVGamePadDefaultValue(false)
		setVMouseDefaultValue(false)
	}, [isSetVGamePadDefaultValue, isSetVMouseDefaultValue])

	useEffect(() => {
		console.log(`configuring menu on ${input.platform}`)
		if (input.platform == 'mobile') {
			setactions([{
				icon: <VideoSettingsOutlinedIcon />,
				name: "Bitrate",
				action: async () => {
					let bitrate = await AskSelectBitrate();
					if (bitrate < 500) {
						return;
					}
					console.log(`bitrate is change to ${bitrate}`);
					await input.bitrate_callback(bitrate); // don't touch async await here, you'll regret that
				},
			},
			{
				icon: <SportsEsportsOutlinedIcon />,
				name: "Edit VGamepad",
				action: async () => {

					setenableVMouse('disable')
					setenableVGamepad((prev) => {
						switch (prev) {
							case "disable":
								return "static";
							case "static":
								return "disable";
						}
					});
				},
			}, {
				icon: <MouseOutlinedIcon />,
				name: "Enable VMouse",
				action: () => {
					setenableVGamepad('disable')
					setenableVMouse((prev) => {
						switch (prev) {
							case "disable":
								return "static";
							case "static":
								return "disable";
						}
					});

				},
			}, {
				icon: <KeyboardIcon />,
				name: "Write to clipboard",
				action: async () => {
					const text = await TurnOnClipboard()
					await input.clipboard_callback(text)
				},
			}, {
				icon: <SettingsIcon />,
				name: "Setting",
				action: () => { setModalSettingOpen(true) },
			},{
				icon: <Fullscreen />,
				name: "Enter fullscreen",
				action: () => {requestFullscreen(); input.fullscreen_callback()}
			},{
				icon: <LockReset/>,
				name: "Reset",
				action: input.reset_callback 
			}
		])
		} else {
			setactions([{
				icon: <VideoSettingsOutlinedIcon />,
				name: "Bitrate",
				action: async () => {
					let bitrate = await AskSelectBitrate();
					if ((20000 < bitrate) || (bitrate < 500)) 
						return;
					
					console.log(`bitrate is change to ${bitrate}`);
					await input.bitrate_callback(bitrate);
				},
			}, {
				icon: <Fullscreen />,
				name: "Enter fullscreen",
				action: () => {requestFullscreen(); input.fullscreen_callback()}
			},{
				icon: <LockReset/>,
				name: "Reset",
				action: input.reset_callback 
			}])
		}
	}, [input.platform])


	const contextValue:IControlContext = {
		isSetVGamePadDefaultValue,
		isSetVMouseDefaultValue
	}
	return (
		<ConTrolContext.Provider value={contextValue}>
			<>
				<div
					className="containerDrag"
					style={{ maxWidth: 'max-content', maxHeight: 'max-content' }}
					onContextMenu=	{e => e.preventDefault()}
					onMouseUp=		{e => e.preventDefault()}
					onMouseDown=	{e => e.preventDefault()}
					onKeyUp=		{e => e.preventDefault()}
					onKeyDown=		{e => e.preventDefault()}
				>
					{
						input.platform === 'mobile' ?

							<MobileControl
								actions={actions}
								isShowBtn={enableVGamepad === 'draggable' || enableVMouse === 'draggable'}
								onOkey={handleOkeyDragValue}
								onDefault={handleSetDeafaultDragValue}
							/> : (<DesktopControl actions={actions} />)
					}
				</div>

				<VirtualMouse
					MouseMoveCallback={input.mouse_move_callback}
					MouseButtonCallback={input.mouse_button_callback}
					draggable={enableVMouse} />

				<VirtualGamepad
					// disable touch when dragging
					//@ts-ignore
					ButtonCallback={enableVGamepad =='draggable' ? () => {} : input.gamepad_callback_b}
					//@ts-ignore
					AxisCallback={enableVGamepad =='draggable' ? () => {} : input.gamepad_callback_a}
					draggable={enableVGamepad}
				/>

				<Setting
					onDraggable={handleDraggable}
					isOpen={isModalSettingOpen}
					closeModal={() => { setModalSettingOpen(false) }}
				/>
			</>
		</ConTrolContext.Provider >
	);
};


