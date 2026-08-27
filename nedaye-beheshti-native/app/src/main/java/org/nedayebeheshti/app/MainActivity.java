package org.nedayebeheshti.app;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.view.ViewGroup;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ImageView;

public class MainActivity extends Activity {
    private static final String APP_URL = "https://app-hs2thc.v2.appdeploy.ai/";
    private WebView webView;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(251,246,237));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(251,246,237));
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setDatabaseEnabled(true);
        webView.getSettings().setGeolocationEnabled(true);
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setBuiltInZoomControls(false);
        webView.getSettings().setDisplayZoomControls(false);

        ImageView splash = new ImageView(this);
        splash.setImageResource(org.nedayebeheshti.app.R.drawable.leader);
        splash.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
        splash.setBackgroundColor(Color.rgb(251,246,237));
        splash.setPadding(40,40,40,40);

        FrameLayout.LayoutParams full = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT, Gravity.CENTER);
        root.addView(webView, full);
        root.addView(splash, full);
        setContentView(root);

        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) { return false; }
            @Override public void onPageFinished(WebView view, String url) {
                splash.animate().alpha(0f).setDuration(280).withEndAction(() -> root.removeView(splash)).start();
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) callback.invoke(origin, true, false);
                else {
                    requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, 100);
                    callback.invoke(origin, true, false);
                }
            }
            @Override public void onPermissionRequest(PermissionRequest request) { request.grant(request.getResources()); }
        });

        if (state == null) webView.loadUrl(APP_URL); else webView.restoreState(state);
    }

    @Override protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }
}
