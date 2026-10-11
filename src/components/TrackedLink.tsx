"use client";

import type { AnchorHTMLAttributes } from "react";
import { track } from "@/lib/track";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Analytics event name, e.g. "click_call" or "click_whatsapp". */
  event: string;
  eventLabel?: string;
};

/** External contact link (tel:, mailto:, WhatsApp, social) that reports a click event. */
export function TrackedLink({ event, eventLabel, onClick, children, ...props }: Props) {
  const external = props.href?.startsWith("http");
  return (
    <a
      {...props}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={(e) => {
        track(event, { label: eventLabel });
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
