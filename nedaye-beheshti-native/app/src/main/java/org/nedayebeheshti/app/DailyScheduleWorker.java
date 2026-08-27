package org.nedayebeheshti.app;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

public class DailyScheduleWorker extends Worker {
    public DailyScheduleWorker(@NonNull Context context,@NonNull WorkerParameters params){super(context,params);}
    @NonNull @Override public Result doWork(){try{PrayerEngine.refresh(getApplicationContext());return Result.success();}catch(Exception e){return Result.retry();}}
}
