package org.nedayebeheshti.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import java.util.HashSet;
import java.util.Set;

public final class AlarmScheduler {
    private static final String PREFS="nedaye_alarm_store",SET_KEY="scheduled_codes";
    private AlarmScheduler(){}
    public static int requestCode(String key){return 1000+((key==null?0:key.hashCode())&0x7fffffff)%60000;}
    public static void schedule(Context context,String id,String prayerKey,String label,long triggerAt,boolean playAdhan){if(id==null||label==null||triggerAt<=System.currentTimeMillis())return;AlarmManager alarm=(AlarmManager)context.getSystemService(Context.ALARM_SERVICE);Intent i=new Intent(context,PrayerAlarmReceiver.class).putExtra("id",id).putExtra("prayerKey",prayerKey).putExtra("label",label).putExtra("playAdhan",playAdhan);int code=requestCode(id);PendingIntent pi=PendingIntent.getBroadcast(context,code,i,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);if(Build.VERSION.SDK_INT>=31){if(alarm.canScheduleExactAlarms())alarm.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,triggerAt,pi);else alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,triggerAt,pi);}else if(Build.VERSION.SDK_INT>=23)alarm.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,triggerAt,pi);else alarm.setExact(AlarmManager.RTC_WAKEUP,triggerAt,pi);SharedPreferences p=context.getSharedPreferences(PREFS,Context.MODE_PRIVATE);Set<String> codes=new HashSet<>(p.getStringSet(SET_KEY,new HashSet<>()));codes.add(String.valueOf(code));p.edit().putStringSet(SET_KEY,codes).putString("alarm_"+code,triggerAt+"\t"+id+"\t"+prayerKey+"\t"+label+"\t"+playAdhan).apply();}
    public static void schedule(Context c,String id,String label,long triggerAt){schedule(c,id,id,label,triggerAt,true);}
    public static void cancelAll(Context context){SharedPreferences p=context.getSharedPreferences(PREFS,Context.MODE_PRIVATE);Set<String> codes=new HashSet<>(p.getStringSet(SET_KEY,new HashSet<>()));AlarmManager alarm=(AlarmManager)context.getSystemService(Context.ALARM_SERVICE);SharedPreferences.Editor e=p.edit();for(String raw:codes)try{int code=Integer.parseInt(raw);PendingIntent pi=PendingIntent.getBroadcast(context,code,new Intent(context,PrayerAlarmReceiver.class),PendingIntent.FLAG_NO_CREATE|PendingIntent.FLAG_IMMUTABLE);if(pi!=null)alarm.cancel(pi);e.remove("alarm_"+code);}catch(Exception ignored){}e.remove(SET_KEY).apply();}
    public static void markFired(Context context,String id){int code=requestCode(id);SharedPreferences p=context.getSharedPreferences(PREFS,Context.MODE_PRIVATE);Set<String> codes=new HashSet<>(p.getStringSet(SET_KEY,new HashSet<>()));codes.remove(String.valueOf(code));p.edit().putStringSet(SET_KEY,codes).remove("alarm_"+code).apply();}
    public static void restoreAll(Context context){SharedPreferences p=context.getSharedPreferences(PREFS,Context.MODE_PRIVATE);Set<String> codes=new HashSet<>(p.getStringSet(SET_KEY,new HashSet<>()));long now=System.currentTimeMillis();for(String raw:new HashSet<>(codes)){String data=p.getString("alarm_"+raw,"");String[] x=data.split("\\t",5);if(x.length<3)continue;try{long trigger=Long.parseLong(x[0]);if(trigger>now){if(x.length>=5)schedule(context,x[1],x[2],x[3],trigger,Boolean.parseBoolean(x[4]));else schedule(context,x[1],x[2],trigger);}else{Set<String> next=new HashSet<>(p.getStringSet(SET_KEY,new HashSet<>()));next.remove(raw);p.edit().putStringSet(SET_KEY,next).remove("alarm_"+raw).apply();}}catch(Exception ignored){}}}
}
