package org.nedayebeheshti.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import java.util.concurrent.TimeUnit;

public class BootReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context,Intent intent){String action=intent==null?null:intent.getAction();if(Intent.ACTION_BOOT_COMPLETED.equals(action)||Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)||Intent.ACTION_TIMEZONE_CHANGED.equals(action)||Intent.ACTION_TIME_CHANGED.equals(action)){PrayerEngine.refresh(context);PeriodicWorkRequest req=new PeriodicWorkRequest.Builder(DailyScheduleWorker.class,12,TimeUnit.HOURS).build();WorkManager.getInstance(context).enqueueUniquePeriodicWork("nedaye-prayer-refresh",ExistingPeriodicWorkPolicy.UPDATE,req);}}
}
