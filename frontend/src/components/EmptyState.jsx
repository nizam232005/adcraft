/**
 * EmptyState — Illustrated empty state with optional CTA.
 */

import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-state-icon">
        <Icon size={36} />
      </div>
      <h3 className="empty-state-title">{title || 'Nothing here yet'}</h3>
      <p className="empty-state-text">{message || 'Get started by creating something new.'}</p>
      {action && action}
    </div>
  );
}
