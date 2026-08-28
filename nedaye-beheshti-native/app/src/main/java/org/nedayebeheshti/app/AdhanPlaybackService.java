package org.nedayebeheshti.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

public class AdhanPlaybackService extends Service {
    private static final String CHANNEL="adhan_playback";
    private MediaPlayer player;
    @Override public void onCreate(){super.onCreate();if(Build.VERSION.SDK_INT>=26){NotificationChannel c=new NotificationChannel(CHANNEL,"پخش اذان",NotificationManager.IMPORTANCE_LOW);c.setSound(null,null);getSystemService(NotificationManager.class).createNotificationChannel(c);}}
    @Override public int onStartCommand(Intent intent,int flags,int startId){String label=intent==null?"نماز":intent.getStringExtra("label"),key=intent==null?"":intent.getStringExtra("prayerKey");if(label==null)label="نماز";startForeground(7001,playbackNotification(label));startPlayback("fajr".equals(key));return START_NOT_STICKY;}
    private Notification playbackNotification(String label){Intent open=new Intent(this,MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP);PendingIntent pi=PendingIntent.getActivity(this,7001,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);Notification.Builder b=Build.VERSION.SDK_INT>=26?new Notification.Builder(this,CHANNEL):new Notification.Builder(this);return b.setSmallIcon(android.R.drawable.ic_media_play).setContentTitle("ندای بهشتی").setContentText("در حال پخش اذان "+label).setContentIntent(pi).setOngoing(true).build();}
    private void startPlayback(boolean fajr){stopPlayer();try{player=MediaPlayer.create(this,fajr?R.raw.default_fajr_adhan:R.raw.default_adhan);if(player==null){stopSelf();return;}player.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());player.setWakeMode(this,PowerManager.PARTIAL_WAKE_LOCK);player.setOnCompletionListener(mp->stopSelf());player.setOnErrorListener((mp,w,e)->{stopSelf();return true;});player.start();}catch(Exception ex){stopSelf();}}
    private void stopPlayer(){if(player!=null){try{if(player.isPlaying())player.stop();}catch(Exception ignored){}try{player.release();}catch(Exception ignored){}player=null;}}
    @Override public void onDestroy(){stopPlayer();stopForeground(true);super.onDestroy();}
    @Override public IBinder onBind(Intent intent){return null;}
}
