"use client";

import React from "react";
import { MantineProvider } from "@mantine/core";
import "./index.css";

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
        <title>React App</title>
        <meta name="description" content="Web site created..." />
      </head>
      <body>
        <MantineProvider>
          <div id="root">{children}</div>
        </MantineProvider>
      </body>
    </html>
  );
}
