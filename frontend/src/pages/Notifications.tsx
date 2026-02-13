import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { notificationsApi } from '@/services/notificationsApi';
import { Notification } from '@/lib/types';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    if (user) {
      try {
        const data = await notificationsApi.getNotifications();
        setNotifications(data.sort(
          (a: Notification, b: Notification) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkRead = async (id: string | number) => {
    await notificationsApi.markAsRead(String(id));
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllAsRead();
    fetchNotifications();
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-2">Stay updated on your library activity</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-colors ${!notification.read ? 'bg-accent/20' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {getIcon(notification.type)}
                      <div className="flex-1">
                        <p className="text-foreground">{notification.message}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <>
                          <Badge>New</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
