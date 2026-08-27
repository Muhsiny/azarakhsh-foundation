package org.nedayebeheshti.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import java.io.File;

public class AdhanPlaybackService extends Service {
    private static final String CHANNEL="adhan_playback";
    private static final String FALLBACK="https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Mishary_Al_Afasy_-_HQ_(%D9%85%D8%B4%D8%A7%D8%B1%D9%8A_%D8%A7%D9%84%D8%B9%D9%81%D8%A7%D8%B3%D9%8A).mp3";
    private MediaPlayer player;
    @Override public void onCreate(){super.onCreate();if(Build.VERSION.SDK_INT>=26){NotificationChannel c=new NotificationChannel(CHANNEL,"پخش اذان",NotificationManager.IMPORTANCE_LOW);c.setSound(null,null);getSystemService(NotificationManager.class).createNotificationChannel(c);}}
    @Override public int onStartCommand(Intent intent,int flags,int startId){String label=intent==null?"نماز":intent.getStringExtra("label"),key=intent==null?"":intent.getStringExtra("prayerKey");if(label==null)label="نماز";startForeground(7001,playbackNotification(label));startPlayback("fajr".equals(key));return START_NOT_STICKY;}
    private Notification playbackNotification(String label){Intent open=new Intent(this,MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP);PendingIntent pi=PendingIntent.getActivity(this,7001,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);Notification.Builder b=Build.VERSION.SDK_INT>=26?new Notification.Builder(this,CHANNEL):new Notification.Builder(this);return b.setSmallIcon(android.R.drawable.ic_media_play).setContentTitle("ندای بهشتی").setContentText("در حال پخش اذان "+label).setContentIntent(pi).setOngoing(true).build();}
    private static String fileName(String url){return "adhan_"+Integer.toHexString((url==null?"":url).hashCode())+".mp3";}
    private void startPlayback(boolean fajr){stopPlayer();try{SharedPreferences p=getSharedPreferences("nedaye_native",MODE_PRIVATE);String normal=p.getString("adhan_url",""),fajrUrl=p.getString("fajr_adhan_url","");String url=fajr&&fajrUrl!=null&&!fajrUrl.trim().isEmpty()?fajrUrl:normal;if(url==null||url.trim().isEmpty())url=FALLBACK;File local=new File(getFilesDir(),fileName(url));player=new MediaPlayer();player.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());player.setWakeMode(this,PowerManager.PARTIAL_WAKE_LOCK);if(local.exists()&&local.length()>0)player.setDataSource(local.getAbsolutePath());else player.setDataSource(url);player.setOnPreparedListener(MediaPlayer::start);player.setOnCompletionListener(mp->stopSelf());player.setOnErrorListener((mp,w,e)->{stopSelf();return true;});player.prepareAsync();}catch(Exception ex){stopSelf();}}
    private void stopPlayer(){if(player!=null){try{if(player.isPlaying())player.stop();}catch(Exception ignored){}try{player.release();}catch(Exception ignored){}player=null;}}
    @Override public void onDestroy(){stopPlayer();stopForeground(true);super.onDestroy();}
    @Override public IBinder onBind(Intent intent){return null;}
}
