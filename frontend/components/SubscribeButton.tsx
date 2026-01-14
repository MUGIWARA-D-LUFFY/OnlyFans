'use client';

import { useState } from 'react';
import { subscriptionService } from '../services/subscription.service';
import { paymentService } from '../services/payment.service';

interface SubscribeButtonProps {
  creatorId: string;
  subscriptionFee: number;
  isSubscribed: boolean;
  onSubscribeChange?: () => void;
}

export default function SubscribeButton({
  creatorId,
  subscriptionFee,
  isSubscribed,
  onSubscribeChange,
}: SubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await paymentService.subscribe(creatorId);
      if (onSubscribeChange) {
        onSubscribeChange();
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      await subscriptionService.unsubscribe(creatorId);
      if (onSubscribeChange) {
        onSubscribeChange();
      }
    } catch (error) {
      console.error('Unsubscription failed:', error);
      alert('Failed to unsubscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <button
        onClick={handleUnsubscribe}
        disabled={isLoading}
        className="button-secondary"
        style={{ 
          opacity: isLoading ? 0.5 : 1,
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Processing...' : 'Unsubscribe'}
      </button>
    );
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={isLoading}
      className="button-primary"
      style={{ 
        opacity: isLoading ? 0.5 : 1,
        cursor: isLoading ? 'not-allowed' : 'pointer'
      }}
    >
      {isLoading ? 'Processing...' : `Subscribe $${subscriptionFee}/month`}
    </button>
  );
}


