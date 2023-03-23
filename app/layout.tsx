"use client"

import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from 'nextjs-google-analytics';
import * as React from 'react';
import StyledComponentsRegistry from '../lib/registry';
import "../styles/globals.css"

import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
	typography:{
		//fontSize: 12,
	},
	components: {
	  // Name of the component
	  MuiButton: {
		styleOverrides: {
		  // Name of the slot
		  root: {
			// Some CSS
			fontSize: '1.2rem',
		  },
		},
	  },
	},
  });
function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html>
			<head>
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
			</head>
			<body>
				<GoogleAnalytics trackPageViews />
				<Analytics />
				<ThemeProvider theme={theme}>
					<StyledComponentsRegistry>
						{children}
 					</StyledComponentsRegistry>
				</ThemeProvider>
			</body>
		</html>
	);
}

export default RootLayout;