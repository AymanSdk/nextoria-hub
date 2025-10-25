import { useEffect, useState, useRef } from "react";
import { useRoom } from "@/liveblocks.config";
import { LiveMap } from "@liveblocks/client";
import {
  computed,
  createPresenceStateDerivation,
  createTLStore,
  react,
  defaultShapeUtils,
  DocumentRecordType,
  InstancePresenceRecordType,
  PageRecordType,
  IndexKey,
  TLAnyShapeUtilConstructor,
  TLDocument,
  TLInstancePresence,
  TLPageId,
  TLRecord,
  TLStoreEventInfo,
  TLStoreWithStatus,
} from "tldraw";

export function useStorageStore({
  shapeUtils = [],
  user,
}: Partial<{
  shapeUtils: TLAnyShapeUtilConstructor[];
  user: {
    id: string;
    color: string;
    name: string;
  };
}>) {
  const room = useRoom();

  const [store] = useState(() => {
    const store = createTLStore({
      shapeUtils: [...defaultShapeUtils, ...shapeUtils],
    });
    return store;
  });

  const [storeWithStatus, setStoreWithStatus] = useState<TLStoreWithStatus>({
    status: "loading",
  });

  const isInitializedRef = useRef(false);
  const userRef = useRef(user);

  // Update user ref when user changes
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    // Prevent re-initialization
    if (isInitializedRef.current) {
      return;
    }

    // Ensure room is available
    if (!room) {
      return;
    }

    const unsubs: (() => void)[] = [];
    setStoreWithStatus({ status: "loading" });

    async function setup() {
      const currentUser = userRef.current;
      // Get Liveblocks Storage
      const { root } = await room.getStorage();

      // Create or get records map (using LiveMap)
      let liveRecords = root.get("tldrawRecords");
      if (!liveRecords) {
        root.set("tldrawRecords", new LiveMap());
        liveRecords = root.get("tldrawRecords");
      }

      // Initialize tldraw with records from Storage
      store.clear();

      // Get existing records from LiveMap
      const existingRecords: TLRecord[] = [];
      if (liveRecords) {
        liveRecords.forEach((record) => {
          existingRecords.push(record as TLRecord);
        });
      }

      store.put(
        [
          DocumentRecordType.create({
            id: "document:document" as TLDocument["id"],
          }),
          PageRecordType.create({
            id: "page:page" as TLPageId,
            name: "Page 1",
            index: "a1" as IndexKey,
          }),
          ...existingRecords,
        ],
        "initialize"
      );

      // Sync tldraw changes with Storage - Listen to ALL sources
      unsubs.push(
        store.listen(
          ({ changes }: TLStoreEventInfo) => {
            room.batch(() => {
              Object.values(changes.added).forEach((record) => {
                liveRecords?.set(record.id, record);
              });

              Object.values(changes.updated).forEach(([_, record]) => {
                liveRecords?.set(record.id, record);
              });

              Object.values(changes.removed).forEach((record) => {
                liveRecords?.delete(record.id);
              });
            });
          },
          { source: "all" } // Changed to "all" to capture everything including shapes
        )
      );

      // Sync tldraw changes with Presence
      function syncStoreWithPresence({ changes }: TLStoreEventInfo) {
        room.batch(() => {
          Object.values(changes.added).forEach((record) => {
            room.updatePresence({ [record.id]: record });
          });

          Object.values(changes.updated).forEach(([_, record]) => {
            room.updatePresence({ [record.id]: record });
          });

          Object.values(changes.removed).forEach((record) => {
            room.updatePresence({ [record.id]: null });
          });
        });
      }

      unsubs.push(
        store.listen(syncStoreWithPresence, {
          source: "user",
          scope: "session",
        })
      );

      unsubs.push(
        store.listen(syncStoreWithPresence, {
          source: "user",
          scope: "presence",
        })
      );

      // Update tldraw when Storage changes
      if (liveRecords) {
        unsubs.push(
          room.subscribe(
            liveRecords,
            (storageChanges: any) => {
              const toRemove: TLRecord["id"][] = [];
              const toPut: TLRecord[] = [];

              for (const update of storageChanges) {
                if (update.type !== "LiveMap") {
                  continue; // Skip non-LiveMap updates
                }

                for (const [id, change] of Object.entries(update.updates)) {
                  const changeType = (change as any).type;

                  switch (changeType) {
                    case "delete": {
                      toRemove.push(id as TLRecord["id"]);
                      break;
                    }

                    case "add":
                    case "update": {
                      const curr = update.node.get(id);
                      if (curr) {
                        toPut.push(curr as any as TLRecord);
                      }
                      break;
                    }
                  }
                }
              }

              store.mergeRemoteChanges(() => {
                if (toRemove.length) {
                  store.remove(toRemove);
                }
                if (toPut.length) {
                  store.put(toPut);
                }
              });
            },
            { isDeep: true }
          )
        );
      }

      // Set user's info
      const userPreferences = computed<{
        id: string;
        color: string;
        name: string;
      }>("userPreferences", () => {
        if (!currentUser) {
          throw new Error("Failed to get user");
        }
        return {
          id: currentUser.id,
          color: currentUser.color,
          name: currentUser.name,
        };
      });

      const connectionIdString = "" + (room.getSelf()?.connectionId || 0);

      const presenceDerivation = createPresenceStateDerivation(
        userPreferences,
        InstancePresenceRecordType.createId(connectionIdString)
      )(store);

      room.updatePresence({
        presence: presenceDerivation.get() ?? null,
      });

      unsubs.push(
        react("when presence changes", () => {
          const presence = presenceDerivation.get() ?? null;
          requestAnimationFrame(() => {
            room.updatePresence({ presence });
          });
        })
      );

      // Sync Liveblocks presence with tldraw
      unsubs.push(
        room.subscribe("others", (others, event) => {
          const toRemove: TLInstancePresence["id"][] = [];
          const toPut: TLInstancePresence[] = [];

          switch (event.type) {
            case "leave": {
              if (event.user.connectionId) {
                toRemove.push(
                  InstancePresenceRecordType.createId(`${event.user.connectionId}`)
                );
              }
              break;
            }

            case "reset": {
              others.forEach((other) => {
                toRemove.push(
                  InstancePresenceRecordType.createId(`${other.connectionId}`)
                );
              });
              break;
            }

            case "enter":
            case "update": {
              const presence = event?.user?.presence;
              if (presence?.presence) {
                toPut.push(event.user.presence.presence);
              }
            }
          }

          store.mergeRemoteChanges(() => {
            if (toRemove.length) {
              store.remove(toRemove);
            }
            if (toPut.length) {
              store.put(toPut);
            }
          });
        })
      );

      setStoreWithStatus({
        store,
        status: "synced-remote",
        connectionStatus: "online",
      });

      isInitializedRef.current = true;
    }

    setup();

    return () => {
      isInitializedRef.current = false;
      unsubs.forEach((fn) => fn());
      unsubs.length = 0;
    };
  }, [room]);

  return storeWithStatus;
}
