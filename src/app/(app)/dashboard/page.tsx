'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/model/User';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
    defaultValues: { acceptMessages: false },
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessage = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/accept-messages');
      setValue('acceptMessages', response.data.isAcceptingMessage);
    } catch (error) {
      handleError(error, 'Failed to fetch message settings');
    } finally {
      setLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setLoading(true);
      try {
        const response = await axios.get<ApiResponse>('/api/get-messages');
        setMessages(response.data.messages || []);
        if (refresh) {
          toast({ title: 'Refreshed messages', description: 'Showing latest messages.' });
        }
      } catch (error) {
        handleError(error, 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post('/api/accept-messages', { acceptMessages: !acceptMessages });
      setValue('acceptMessages', !acceptMessages);
      toast({ title: response.data.message });
    } catch (error) {
      handleError(error, 'Failed to update message setting');
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((message) => message._id !== messageId));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({ title: 'URL copied to clipboard' });
  };

  const handleError = (error: unknown, defaultMessage: string) => {
    const axiosError = error as AxiosError<ApiResponse>;
    toast({
      title: 'Error',
      description: axiosError.response?.data.message || defaultMessage,
      variant: 'destructive',
    });
  };

  const profileUrl = useMemo(() => {
    if (!session?.user) return '';
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    return `${baseUrl}/u/${session.user as User}`;
  }, [session]);

  useEffect(() => {
    if (!session?.user) return;
    fetchMessages();
    fetchAcceptMessage();
  }, [session, fetchMessages, fetchAcceptMessage]);

  if (!session?.user) return <div>Please Login</div>;

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center">
          <input type="text" value={profileUrl} disabled className="input input-bordered w-full p-2 mr-2" />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">Accept Messages: {acceptMessages ? 'On' : 'Off'}</span>
      </div>

      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={() => fetchMessages(true)}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
      </Button>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default Page;
