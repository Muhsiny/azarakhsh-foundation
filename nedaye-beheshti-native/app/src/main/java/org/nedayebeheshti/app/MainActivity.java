package org.nedayebeheshti.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.ViewGroup;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ImageView;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class MainActivity extends Activity {
    private static final String APP_URL = "https://app-hs2thc.v2.appdeploy.ai/";
    private static final int REQ_LOCATION = 100;
    private static final int REQ_FILE = 101;
    private static final int REQ_NOTIFICATIONS = 102;
    private static final String CHANNEL_PRAYER = "prayer_alerts";
    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;
    private GeolocationPermissions.Callback geoCallback;
    private String geoOrigin;

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        createPrayerChannel();
        requestNotificationPermission();

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(251,246,237));

        webView = new WebView(this);
        WebView.setWebContentsDebuggingEnabled(false);
        webView.setBackgroundColor(Color.rgb(251,246,237));
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setDatabaseEnabled(true);
        webView.getSettings().setGeolocationEnabled(true);
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAllowContentAccess(true);
        webView.getSettings().setBuiltInZoomControls(false);
        webView.getSettings().setDisplayZoomControls(false);
        webView.addJavascriptInterface(new NativeBridge(this), "NedayeNative");

        ImageView splash = new ImageView(this);
        splash.setImageResource(R.drawable.leader);
        splash.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
        splash.setBackgroundColor(Color.rgb(251,246,237));
        splash.setPadding(40, 40, 40, 40);

        FrameLayout.LayoutParams full = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT, Gravity.CENTER);
        root.addView(webView, full);
        root.addView(splash, full);
        setContentView(root);

        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) { return false; }
            @Override public void onPageFinished(WebView view, String url) {
                if (splash.getParent() != null) splash.animate().alpha(0f).setDuration(280).withEndAction(() -> root.removeView(splash)).start();
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                if (Build.VERSION.SDK_INT < 23 || checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                    callback.invoke(origin, true, false);
                } else {
                    geoOrigin = origin;
                    geoCallback = callback;
                    requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, REQ_LOCATION);
                }
            }

            @Override public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(request::deny);
            }

            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try {
                    startActivityForResult(params.createIntent(), REQ_FILE);
                    return true;
                } catch (Exception ex) {
                    fileCallback = null;
                    return false;
                }
            }
        });

        if (state == null) webView.loadUrl(APP_URL); else webView.restoreState(state);
    }

    private void createPrayerChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel c = new NotificationChannel(CHANNEL_PRAYER, "اوقات نماز", NotificationManager.IMPORTANCE_HIGH);
            c.setDescription("هشدارهای نماز ندای بهشتی");
            c.enableVibration(true);
            getSystemService(NotificationManager.class).createNotificationChannel(c);
        }
    }

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIFICATIONS);
        }
    }

    private void postNotification(String title, String body) {
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return;
        Intent open = new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(this, 440, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, CHANNEL_PRAYER) : new Notification.Builder(this);
        b.setSmallIcon(android.R.drawable.ic_lock_idle_alarm).setContentTitle(title).setContentText(body).setAutoCancel(true).setContentIntent(pi).setPriority(Notification.PRIORITY_HIGH);
        ((NotificationManager)getSystemService(NOTIFICATION_SERVICE)).notify((int)(System.currentTimeMillis() & 0x7fffffff), b.build());
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(requestCode, permissions, results);
        if (requestCode == REQ_LOCATION && geoCallback != null) {
            boolean granted = results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED;
            geoCallback.invoke(geoOrigin, granted, false);
            geoCallback = null;
            geoOrigin = null;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_FILE && fileCallback != null) {
            Uri[] result = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            fileCallback.onReceiveValue(result);
            fileCallback = null;
        }
    }

    @Override protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }

    public class NativeBridge {
        private final Context context;
        NativeBridge(Context context) { this.context = context.getApplicationContext(); }

        @JavascriptInterface public void notify(String title, String body) {
            runOnUiThread(() -> postNotification(title, body));
        }

        @JavascriptInterface public void schedulePrayer(String key, String label, double triggerAtMillis) {
            AlarmScheduler.schedule(context, key, label, (long)triggerAtMillis);
        }

        @JavascriptInterface public void cancelPrayerAlarms() {
            AlarmScheduler.cancelAll(context);
        }

        @JavascriptInterface public void setAdhanUrl(String url) {
            context.getSharedPreferences("nedaye_native", MODE_PRIVATE).edit().putString("adhan_url", url == null ? "" : url).apply();
        }

        @JavascriptInterface public void downloadAdhan(String url) {
            if (url == null || url.trim().isEmpty()) return;
            new Thread(() -> {
                File tmp = new File(context.getFilesDir(), "adhan.mp3.tmp");
                File dest = new File(context.getFilesDir(), "adhan.mp3");
                HttpURLConnection conn = null;
                try {
                    conn = (HttpURLConnection)new URL(url).openConnection();
                    conn.setConnectTimeout(20000);
                    conn.setReadTimeout(45000);
                    conn.setInstanceFollowRedirects(true);
                    conn.connect();
                    if (conn.getResponseCode() < 200 || conn.getResponseCode() >= 300) return;
                    try (InputStream in = conn.getInputStream(); FileOutputStream out = new FileOutputStream(tmp)) {
                        byte[] buf = new byte[8192]; int n;
                        while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                    }
                    if (dest.exists()) dest.delete();
                    if (tmp.renameTo(dest)) context.getSharedPreferences("nedaye_native", MODE_PRIVATE).edit().putString("downloaded_url", url).apply();
                } catch (Exception ignored) {
                    tmp.delete();
                } finally {
                    if (conn != null) conn.disconnect();
                }
            }).start();
        }
    }
}
