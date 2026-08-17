import Modal from './Modal.jsx';
import Button from './Button.jsx';

function ConfirmModal({ isOpen, onClose, onConfirm, title = 'Are you sure?', message = 'This action cannot be undone.', confirmText = 'Delete', danger = true }) {
  return (
    <Modal
      isOpen={isOpen} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>{confirmText}</Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
export default ConfirmModal;