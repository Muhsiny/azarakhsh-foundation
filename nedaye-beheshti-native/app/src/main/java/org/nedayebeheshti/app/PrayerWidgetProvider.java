package org.nedayebeheshti.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

public class PrayerWidgetProvider extends AppWidgetProvider {
    @Override public void onUpdate(Context context,AppWidgetManager manager,int[] ids){for(int id:ids)update(context,manager,id);}
    private static void update(Context context,AppWidgetManager manager,int id){String[] s=PrayerEngine.widgetSnapshot(context);RemoteViews v=new RemoteViews(context.getPackageName(),R.layout.prayer_widget);v.setTextViewText(R.id.widget_location,s[0]);v.setTextViewText(R.id.widget_next,"نماز بعدی: "+s[1]);v.setTextViewText(R.id.widget_times,s[2]);Intent open=new Intent(context,MainActivity.class);PendingIntent pi=PendingIntent.getActivity(context,9001,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);v.setOnClickPendingIntent(R.id.widget_root,pi);manager.updateAppWidget(id,v);}
    public static void updateAll(Context context){AppWidgetManager m=AppWidgetManager.getInstance(context);ComponentName c=new ComponentName(context,PrayerWidgetProvider.class);int[] ids=m.getAppWidgetIds(c);for(int id:ids)update(context,m,id);}
}
