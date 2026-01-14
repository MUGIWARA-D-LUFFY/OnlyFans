'use client';

import { useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

interface MessageBoxProps {
  receiverId: string;
  onMessageSent?: () => void;
}

export default function MessageBox({ receiverId, onMessageSent }: MessageBoxProps) {
  const [message, setMessage] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  const connectSocket = () => {
    if (!socket) {
      const token = Cookies.get('accessToken');
      const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
        auth: { token },
      });
      setSocket(newSocket);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    if (!socket) {
      connectSocket();
      return;
    }

    socket.emit('send_message', {
      receiverId,
      content: message,
      isPaid,
      price: isPaid ? price : undefined,
    });

    setMessage('');
    setIsPaid(false);
    setPrice(0);

    if (onMessageSent) {
      onMessageSent();
    }
  };

  return (
    <div className="card">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        style={{ marginBottom: 'var(--spacing-md)' }}
        rows={3}
      />
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-md)'
      }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--spacing-sm)',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer',
              accentColor: 'var(--primary-blue)'
            }}
          />
          <span className="text-meta">Paid message</span>
        </label>
        {isPaid && (
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            placeholder="Price"
            min="0"
            step="0.01"
            style={{
              width: '100px',
              padding: 'var(--spacing-xs) var(--spacing-sm)'
            }}
          />
        )}
      </div>
      <button
        onClick={handleSend}
        className="button-primary"
      >
        Send
      </button>
    </div>
  );
}


