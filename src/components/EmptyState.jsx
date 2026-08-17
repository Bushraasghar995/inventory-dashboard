import { Inbox } from 'lucide-react';

function EmptyState({ title = 'No data found', message = 'Nothing to show here yet.', icon: Icon = Inbox }) {
  return (
    <div className="empty-state">
      <Icon size={40} strokeWidth={1.3} />
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
export default EmptyState;