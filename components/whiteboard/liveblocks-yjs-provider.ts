import { Room } from "@liveblocks/client";
import * as Y from "yjs";
import { TLStore } from "tldraw";

export class LiveblocksYjsProvider {
  private room: Room;
  private yDoc: Y.Doc;
  private destroyed = false;
  private tlStore: TLStore | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(room: Room, yDoc: Y.Doc) {
    this.room = room;
    this.yDoc = yDoc;
    this.setupSync();
  }

  private setupSync() {
    // Listen to Yjs document changes
    this.yDoc.on("update", (update: Uint8Array, origin: any) => {
      if (this.destroyed || origin === "liveblocks") return;

      try {
        // Broadcast update to other users via Liveblocks
        this.room.broadcastEvent({
          type: "yjs-update",
          update: Array.from(update),
        });
      } catch (error) {
        console.error("Error broadcasting Yjs update:", error);
      }
    });

    // Listen to Liveblocks events for Yjs updates from other users
    this.unsubscribe = this.room.subscribe("event", (event: any) => {
      if (this.destroyed || event.event.type !== "yjs-update") return;

      try {
        const update = new Uint8Array(event.event.update);
        Y.applyUpdate(this.yDoc, update, "liveblocks");
      } catch (error) {
        console.error("Error applying Yjs update:", error);
      }
    });
  }

  syncTldrawStore(store: TLStore) {
    this.tlStore = store;

    // Create a Yjs map for tldraw records
    const yRecords = this.yDoc.getMap("tldraw");

    // Listen to tldraw changes and update Yjs
    store.listen(
      ({ changes }) => {
        if (this.destroyed) return;

        this.yDoc.transact(() => {
          // Add/update records
          Object.values(changes.added).forEach((record) => {
            yRecords.set(record.id, record as any);
          });

          Object.values(changes.updated).forEach(([_from, to]) => {
            yRecords.set(to.id, to as any);
          });

          // Remove records
          Object.values(changes.removed).forEach((record) => {
            yRecords.delete(record.id);
          });
        }, this);
      },
      { source: "user", scope: "document" }
    );

    // Listen to Yjs changes and update tldraw
    yRecords.observe((event) => {
      if (this.destroyed || !this.tlStore || event.transaction.origin === this) return;

      const recordsToAdd: any[] = [];
      const recordsToRemove: any[] = [];

      event.changes.keys.forEach((change, key) => {
        if (change.action === "add" || change.action === "update") {
          const record = yRecords.get(key);
          if (record) recordsToAdd.push(record);
        } else if (change.action === "delete") {
          recordsToRemove.push({ id: key });
        }
      });

      this.tlStore.mergeRemoteChanges(() => {
        if (recordsToAdd.length) this.tlStore!.put(recordsToAdd);
        if (recordsToRemove.length)
          this.tlStore!.remove(recordsToRemove.map((r) => r.id));
      });
    });

    // Initial sync: Load existing Yjs records into tldraw
    const existingRecords: any[] = [];
    yRecords.forEach((value) => {
      existingRecords.push(value);
    });

    if (existingRecords.length) {
      store.mergeRemoteChanges(() => {
        store.put(existingRecords);
      });
    }
  }

  destroy() {
    this.destroyed = true;
    this.tlStore = null;
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
