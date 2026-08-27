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
    @Override public void onReceive(Context context,Intent intent){String id=intent.getStringExtra("id"),key=intent.getStringExtra("prayerKey"),label=intent.getStringExtra("label");boolean play=intent.getBooleanExtra("playAdhan",true);if(label==null)label="نماز";if(id!=null)AlarmScheduler.markFired(context,id);showNotification(context,play?"وقت "+label:"یادآوری نماز",play?"اکنون وقت "+label+" است.":label);if(play){Intent service=new Intent(context,AdhanPlaybackService.class).putExtra("label",label).putExtra("prayerKey",key);try{if(Build.VERSION.SDK_INT>=26)context.startForegroundService(service);else context.startService(service);}catch(Exception ignored){}}PrayerWidgetProvider.updateAll(context);}
    private void showNotification(Context context,String title,String body){if(Build.VERSION.SDK_INT>=33&&context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)return;boolean vibrate=context.getSharedPreferences("nedaye_native",Context.MODE_PRIVATE).getBoolean("vibration",true);String channel=vibrate?"prayer_alerts_vibrate":"prayer_alerts_silent";NotificationManager nm=(NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);if(Build.VERSION.SDK_INT>=26){NotificationChannel c=new NotificationChannel(channel,"اوقات نماز",NotificationManager.IMPORTANCE_HIGH);c.enableVibration(vibrate);c.setSound(null,null);nm.createNotificationChannel(c);}Intent open=new Intent(context,MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP);PendingIntent pi=PendingIntent.getActivity(context,441,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);Notification.Builder b=Build.VERSION.SDK_INT>=26?new Notification.Builder(context,channel):new Notification.Builder(context);b.setSmallIcon(android.R.drawable.ic_lock_idle_alarm).setContentTitle(title).setContentText(body).setContentIntent(pi).setAutoCancel(true).setPriority(Notification.PRIORITY_HIGH);if(Build.VERSION.SDK_INT<26&&!vibrate)b.setVibrate(new long[]{0});nm.notify(5100+(title.hashCode()&0x7fffffff)%800,b.build());}
}
