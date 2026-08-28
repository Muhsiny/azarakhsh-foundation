package org.nedayebeheshti.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.Gravity;
import android.view.ViewGroup;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ImageView;
import androidx.webkit.WebViewAssetLoader;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.TimeUnit;

public class MainActivity extends Activity implements SensorEventListener {
    private static final String APP_DOMAIN="app-hs2thc.v2.appdeploy.ai";
    private static final String LOCAL_APP_URL="https://"+APP_DOMAIN+"/index.html";
    private static final int REQ_LOCATION=100,REQ_FILE=101,REQ_NOTIFICATIONS=102;
    private static final String CHANNEL_PRAYER="prayer_alerts_vibrate";
    private WebView webView; private WebViewAssetLoader assetLoader; private ValueCallback<Uri[]> fileCallback; private GeolocationPermissions.Callback geoCallback; private String geoOrigin;
    private SensorManager sensorManager; private Sensor rotationSensor; private volatile double nativeHeading=0;

    @SuppressLint({"SetJavaScriptEnabled","JavascriptInterface"}) @Override protected void onCreate(Bundle state){super.onCreate(state);createPrayerChannel();requestNotificationPermission();startDailyWorker();
        sensorManager=(SensorManager)getSystemService(SENSOR_SERVICE);rotationSensor=sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        FrameLayout root=new FrameLayout(this);root.setBackgroundColor(Color.rgb(251,246,237));webView=new WebView(this);WebView.setWebContentsDebuggingEnabled(false);webView.setBackgroundColor(Color.rgb(251,246,237));webView.getSettings().setJavaScriptEnabled(true);webView.getSettings().setDomStorageEnabled(true);webView.getSettings().setDatabaseEnabled(true);webView.getSettings().setGeolocationEnabled(true);webView.getSettings().setMediaPlaybackRequiresUserGesture(false);webView.getSettings().setAllowFileAccess(false);webView.getSettings().setAllowContentAccess(false);webView.getSettings().setBuiltInZoomControls(false);webView.getSettings().setDisplayZoomControls(false);webView.addJavascriptInterface(new NativeBridge(getApplicationContext()),"NedayeNative");
        assetLoader=new WebViewAssetLoader.Builder().setDomain(APP_DOMAIN).addPathHandler("/",new WebViewAssetLoader.AssetsPathHandler(this)).build();
        ImageView splash=new ImageView(this);splash.setImageResource(R.drawable.leader);splash.setScaleType(ImageView.ScaleType.CENTER_INSIDE);splash.setBackgroundColor(Color.rgb(251,246,237));splash.setPadding(40,40,40,40);FrameLayout.LayoutParams full=new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.MATCH_PARENT,Gravity.CENTER);root.addView(webView,full);root.addView(splash,full);setContentView(root);
        webView.setWebViewClient(new WebViewClient(){@Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest req){Uri u=req.getUrl();String host=u.getHost(),path=u.getPath()==null?"":u.getPath();if(APP_DOMAIN.equals(host)&&(path.startsWith("/api/")||path.startsWith("/__appdeploy/")))return null;WebResourceResponse local=assetLoader.shouldInterceptRequest(u);return local!=null?local:super.shouldInterceptRequest(view,req);}@Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest req){return false;}@Override public void onPageFinished(WebView view,String url){if(splash.getParent()!=null)splash.animate().alpha(0f).setDuration(280).withEndAction(()->root.removeView(splash)).start();}});
        webView.setWebChromeClient(new WebChromeClient(){@Override public void onGeolocationPermissionsShowPrompt(String origin,GeolocationPermissions.Callback callback){if(Build.VERSION.SDK_INT<23||checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)==PackageManager.PERMISSION_GRANTED)callback.invoke(origin,true,false);else{geoOrigin=origin;geoCallback=callback;requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.ACCESS_COARSE_LOCATION},REQ_LOCATION);}}@Override public void onPermissionRequest(PermissionRequest request){runOnUiThread(request::deny);}@Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){if(fileCallback!=null)fileCallback.onReceiveValue(null);fileCallback=callback;try{startActivityForResult(params.createIntent(),REQ_FILE);return true;}catch(Exception e){fileCallback=null;return false;}}});
        if(state==null)webView.loadUrl(LOCAL_APP_URL);else webView.restoreState(state);
    }
    private void startDailyWorker(){PeriodicWorkRequest req=new PeriodicWorkRequest.Builder(DailyScheduleWorker.class,12,TimeUnit.HOURS).build();WorkManager.getInstance(this).enqueueUniquePeriodicWork("nedaye-prayer-refresh",ExistingPeriodicWorkPolicy.UPDATE,req);}
    private void createPrayerChannel(){if(Build.VERSION.SDK_INT>=26){NotificationChannel c=new NotificationChannel(CHANNEL_PRAYER,"اوقات نماز",NotificationManager.IMPORTANCE_HIGH);c.setDescription("هشدارهای نماز ندای بهشتی");c.enableVibration(true);c.setSound(null,null);getSystemService(NotificationManager.class).createNotificationChannel(c);}}
    private void requestNotificationPermission(){if(Build.VERSION.SDK_INT>=33&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},REQ_NOTIFICATIONS);}
    private void postNotification(String title,String body){if(Build.VERSION.SDK_INT>=33&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)return;Intent open=new Intent(this,MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP);PendingIntent pi=PendingIntent.getActivity(this,440,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);Notification.Builder b=Build.VERSION.SDK_INT>=26?new Notification.Builder(this,CHANNEL_PRAYER):new Notification.Builder(this);b.setSmallIcon(android.R.drawable.ic_lock_idle_alarm).setContentTitle(title).setContentText(body).setAutoCancel(true).setContentIntent(pi).setPriority(Notification.PRIORITY_HIGH);((NotificationManager)getSystemService(NOTIFICATION_SERVICE)).notify((int)(System.currentTimeMillis()&0x7fffffff),b.build());}
    @Override public void onRequestPermissionsResult(int code,String[] permissions,int[] results){super.onRequestPermissionsResult(code,permissions,results);if(code==REQ_LOCATION&&geoCallback!=null){boolean granted=results.length>0&&results[0]==PackageManager.PERMISSION_GRANTED;geoCallback.invoke(geoOrigin,granted,false);geoCallback=null;geoOrigin=null;}}
    @Override protected void onActivityResult(int code,int result,Intent data){super.onActivityResult(code,result,data);if(code==REQ_FILE&&fileCallback!=null){fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result,data));fileCallback=null;}}
    @Override protected void onResume(){super.onResume();if(rotationSensor!=null)sensorManager.registerListener(this,rotationSensor,SensorManager.SENSOR_DELAY_UI);}
    @Override protected void onPause(){if(sensorManager!=null)sensorManager.unregisterListener(this);super.onPause();}
    @Override public void onSensorChanged(SensorEvent event){if(event.sensor.getType()!=Sensor.TYPE_ROTATION_VECTOR)return;float[] matrix=new float[9],orientation=new float[3];SensorManager.getRotationMatrixFromVector(matrix,event.values);SensorManager.getOrientation(matrix,orientation);double az=Math.toDegrees(orientation[0]);if(az<0)az+=360;nativeHeading=az;}
    @Override public void onAccuracyChanged(Sensor sensor,int accuracy){}
    @Override protected void onSaveInstanceState(Bundle out){webView.saveState(out);super.onSaveInstanceState(out);}
    @Override public void onBackPressed(){if(webView!=null&&webView.canGoBack())webView.goBack();else super.onBackPressed();}
    private static String adhanFile(String url){return "adhan_"+Integer.toHexString((url==null?"":url).hashCode())+".mp3";}

    public class NativeBridge {private final Context context;NativeBridge(Context c){context=c;}
        @JavascriptInterface public void notify(String title,String body){runOnUiThread(()->postNotification(title,body));}
        @JavascriptInterface public void syncPrayerConfig(String json){PrayerEngine.saveAndSchedule(context,json);startDailyWorker();}
        @JavascriptInterface public void schedulePrayer(String key,String label,double at){AlarmScheduler.schedule(context,key,key,label,(long)at,true);}
        @JavascriptInterface public void scheduleAlert(String id,String prayerKey,String label,double at,boolean play){AlarmScheduler.schedule(context,id,prayerKey,label,(long)at,play);}
        @JavascriptInterface public void cancelPrayerAlarms(){AlarmScheduler.cancelAll(context);}
        @JavascriptInterface public void setAdhanUrl(String url){context.getSharedPreferences("nedaye_native",MODE_PRIVATE).edit().putString("adhan_url",url==null?"":url).apply();}
        @JavascriptInterface public void setFajrAdhanUrl(String url){context.getSharedPreferences("nedaye_native",MODE_PRIVATE).edit().putString("fajr_adhan_url",url==null?"":url).apply();}
        @JavascriptInterface public void setVibration(boolean v){context.getSharedPreferences("nedaye_native",MODE_PRIVATE).edit().putBoolean("vibration",v).apply();}
        @JavascriptInterface public double getHeading(){return nativeHeading;}
        @JavascriptInterface public void updateWidget(){PrayerWidgetProvider.updateAll(context);}
        @JavascriptInterface public void requestExactAlarmPermission(){if(Build.VERSION.SDK_INT>=31){AlarmManager a=(AlarmManager)getSystemService(ALARM_SERVICE);if(!a.canScheduleExactAlarms())try{startActivity(new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,Uri.parse("package:"+getPackageName())));}catch(Exception ignored){}}}
        @JavascriptInterface public void downloadAdhan(String url){if(url==null||url.trim().isEmpty())return;new Thread(()->{File tmp=new File(context.getFilesDir(),adhanFile(url)+".tmp"),dest=new File(context.getFilesDir(),adhanFile(url));HttpURLConnection conn=null;try{conn=(HttpURLConnection)new URL(url).openConnection();conn.setConnectTimeout(20000);conn.setReadTimeout(45000);conn.setInstanceFollowRedirects(true);conn.connect();if(conn.getResponseCode()<200||conn.getResponseCode()>=300)return;try(InputStream in=conn.getInputStream();FileOutputStream out=new FileOutputStream(tmp)){byte[] buf=new byte[8192];int n;while((n=in.read(buf))>0)out.write(buf,0,n);}if(dest.exists())dest.delete();tmp.renameTo(dest);}catch(Exception ignored){tmp.delete();}finally{if(conn!=null)conn.disconnect();}}).start();}
    }
}
