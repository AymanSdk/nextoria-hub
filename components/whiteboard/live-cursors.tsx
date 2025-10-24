"use client";

import { useOthers } from "@/liveblocks.config";
import {
  Cursor,
  CursorBody,
  CursorName,
  CursorPointer,
} from "@/components/ui/shadcn-io/cursor";

export function LiveCursors() {
  const others = useOthers();

  return (
    <>
      {others.map((user) => {
        const presence = user.presence?.presence;

        if (!presence?.cursor) {
          return null;
        }

        const color = user.info?.color || "#000000";
        const name = user.info?.name || "Anonymous";

        return (
          <div
            key={user.id}
            className='pointer-events-none fixed z-50'
            style={{
              left: 0,
              top: 0,
              transform: `translate(${presence.cursor.x}px, ${presence.cursor.y}px)`,
              transition: "transform 0.12s cubic-bezier(0.25, 0.1, 0.25, 1)",
            }}
          >
            <Cursor>
              <CursorPointer style={{ color }} />
              <CursorBody
                style={{
                  backgroundColor: color,
                  color: "white",
                }}
              >
                <CursorName>{name}</CursorName>
              </CursorBody>
            </Cursor>
          </div>
        );
      })}
    </>
  );
}
