import { useContext } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { ToastContext } from '../context/ToastContext.jsx';
import './Toast.css';

const icons = { success: CheckCircle2, error: XCircle, info: Info };

function Toast() {
  const { toasts, removeToast } = useContext(ToastContext);

  return (
    <div className="toast-stack">
      {toasts.map(t => {
        const Icon = icons[t.type] || Info;
        return (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => removeToast(t.id)}>
            <Icon size={18} />
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
export default Toast;