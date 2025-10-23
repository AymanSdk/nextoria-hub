import { NotificationsClient } from "./notifications-client";
import { TestNotificationsButton } from "./test-button";

export default function NotificationsPage() {
  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <TestNotificationsButton />
      </div>
      <NotificationsClient />
    </div>
  );
}
