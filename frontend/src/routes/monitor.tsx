import { EventLog } from '../components/EventLog';
import { SecurityCodePanel } from '../components/SecurityCodePanel';
import { StatusMonitor } from '../components/StatusMonitor';

export function MonitorRoute() {
  return (
    <div className="grid gap-6">
      <StatusMonitor />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <EventLog />
        <SecurityCodePanel />
      </div>
    </div>
  );
}