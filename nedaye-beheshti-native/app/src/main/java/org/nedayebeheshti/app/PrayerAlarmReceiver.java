package org.nedayebeheshti.app;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;

public class PrayerAlarmReceiver extends BroadcastReceiver {
    private static final String CHANNEL = "prayer_alerts";

    @Override public void onReceive(Context context, Intent intent) {
        String key = intent.getStringExtra("key");
        String label = intent.getStringExtra("label");
        if (label == null) label = "نماز";
        if (key != null) AlarmScheduler.markFired(context, key);
        showNotification(context, "وقت " + label, "اکنون وقت " + label + " است.");
        Intent service = new Intent(context, AdhanPlaybackService.class).putExtra("label", label);
        try {
            if (Build.VERSION.SDK_INT >= 26) context.startForegroundService(service); else context.startService(service);
        } catch (Exception ignored) {}
    }

    private void showNotification(Context context, String title, String body) {
        if (Build.VERSION.SDK_INT >= 33 && context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return;
        NotificationManager nm = (NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel c = new NotificationChannel(CHANNEL, "اوقات نماز", NotificationManager.IMPORTANCE_HIGH);
            c.enableVibration(true);
            nm.createNotificationChannel(c);
        }
        Intent open = new Intent(context, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(context, 441, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(context, CHANNEL) : new Notification.Builder(context);
        b.setSmallIcon(android.R.drawable.ic_lock_idle_alarm).setContentTitle(title).setContentText(body).setContentIntent(pi).setAutoCancel(true).setPriority(Notification.PRIORITY_HIGH);
        nm.notify(5100 + ((keyHash(title)) % 800), b.build());
    }

    private int keyHash(String s) { return (s == null ? 0 : s.hashCode()) & 0x7fffffff; }
}
