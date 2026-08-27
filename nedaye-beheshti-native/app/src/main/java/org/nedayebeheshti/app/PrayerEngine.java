package org.nedayebeheshti.app;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONObject;

import java.util.Calendar;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TimeZone;

public final class PrayerEngine {
    private static final String PREFS="nedaye_prayer_config";
    private static final String CONFIG="config_json";
    private static final String[] KEYS={"fajr","dhuhr","asr","maghrib","isha"};
    private static final String[] LABELS={"فجر","ظهر","عصر","مغرب","عشاء"};
    private PrayerEngine(){}

    public static class Config {
        double lat=34.8216,lon=67.8273,fajrAngle=16,maghribAngle=4,ishaAngle=14;
        String timezone="Asia/Kabul",location="بامیان",adhanUrl="",fajrAdhanUrl="";
        int preAlert=10;
        boolean enabled=true,vibration=true;
        final Map<String,Integer> offsets=new LinkedHashMap<>();
        final Map<String,Boolean> alerts=new LinkedHashMap<>();
        Config(){for(String k:new String[]{"fajr","sunrise","dhuhr","asr","maghrib","isha"})offsets.put(k,0);for(String k:KEYS)alerts.put(k,true);}
    }

    public static Config parse(String json){Config c=new Config();try{JSONObject o=new JSONObject(json==null?"{}":json);c.lat=o.optDouble("lat",c.lat);c.lon=o.optDouble("lon",c.lon);c.fajrAngle=o.optDouble("fajrAngle",c.fajrAngle);c.maghribAngle=o.optDouble("maghribAngle",c.maghribAngle);c.ishaAngle=o.optDouble("ishaAngle",c.ishaAngle);c.timezone=o.optString("timezone",c.timezone);c.location=o.optString("locationName",c.location);c.preAlert=o.optInt("preAlertMinutes",c.preAlert);c.enabled=o.optBoolean("adhanEnabled",c.enabled);c.vibration=o.optBoolean("vibration",c.vibration);c.adhanUrl=o.optString("adhanUrl","");c.fajrAdhanUrl=o.optString("fajrAdhanUrl","");JSONObject off=o.optJSONObject("offsets");if(off!=null)for(String k:c.offsets.keySet())c.offsets.put(k,off.optInt(k,0));JSONObject a=o.optJSONObject("prayerAlerts");if(a!=null)for(String k:KEYS)c.alerts.put(k,a.optBoolean(k,true));}catch(Exception ignored){}return c;}
    public static void saveAndSchedule(Context context,String json){context.getSharedPreferences(PREFS,Context.MODE_PRIVATE).edit().putString(CONFIG,json==null?"{}":json).apply();Config c=parse(json);SharedPreferences.Editor e=context.getSharedPreferences("nedaye_native",Context.MODE_PRIVATE).edit().putString("adhan_url",c.adhanUrl).putString("fajr_adhan_url",c.fajrAdhanUrl).putBoolean("vibration",c.vibration);e.apply();scheduleRolling(context,c);PrayerWidgetProvider.updateAll(context);}
    public static Config load(Context context){return parse(context.getSharedPreferences(PREFS,Context.MODE_PRIVATE).getString(CONFIG,"{}"));}
    public static void refresh(Context context){scheduleRolling(context,load(context));PrayerWidgetProvider.updateAll(context);}

    public static void scheduleRolling(Context context,Config c){AlarmScheduler.cancelAll(context);if(!c.enabled)return;TimeZone tz=TimeZone.getTimeZone(c.timezone);Calendar base=Calendar.getInstance(tz);for(int day=0;day<10;day++){Calendar d=(Calendar)base.clone();d.add(Calendar.DAY_OF_YEAR,day);d.set(Calendar.HOUR_OF_DAY,12);d.set(Calendar.MINUTE,0);d.set(Calendar.SECOND,0);d.set(Calendar.MILLISECOND,0);Map<String,String> times=times(d,c);for(int i=0;i<KEYS.length;i++){String key=KEYS[i];if(!Boolean.TRUE.equals(c.alerts.get(key)))continue;long trigger=at(tz,d,times.get(key));if(trigger>System.currentTimeMillis()){String id=stamp(d)+"-"+key;AlarmScheduler.schedule(context,id,key,LABELS[i],trigger,true);if(c.preAlert>0){long pre=trigger-c.preAlert*60000L;if(pre>System.currentTimeMillis())AlarmScheduler.schedule(context,id+"-pre",key,c.preAlert+" دقیقه تا "+LABELS[i],pre,false);}}}}}

    private static long at(TimeZone tz,Calendar day,String hhmm){String[] p=hhmm.split(":");Calendar t=Calendar.getInstance(tz);t.clear();t.set(day.get(Calendar.YEAR),day.get(Calendar.MONTH),day.get(Calendar.DAY_OF_MONTH),Integer.parseInt(p[0]),Integer.parseInt(p[1]),0);return t.getTimeInMillis();}
    private static String stamp(Calendar d){return d.get(Calendar.YEAR)+"-"+(d.get(Calendar.MONTH)+1)+"-"+d.get(Calendar.DAY_OF_MONTH);}
    private static double rad(double d){return d*Math.PI/180d;} private static double deg(double r){return r*180d/Math.PI;} private static double norm(double n,double m){return ((n%m)+m)%m;}
    private static double event(Calendar date,double lat,double lon,double zenith,boolean rising){int n=date.get(Calendar.DAY_OF_YEAR);double lh=lon/15d,t=n+((rising?6d:18d)-lh)/24d,m=.9856d*t-3.289d,l=m+1.916d*Math.sin(rad(m))+.02d*Math.sin(rad(2*m))+282.634d;l=norm(l,360);double ra=deg(Math.atan(.91764d*Math.tan(rad(l))));ra=norm(ra,360);ra+=(Math.floor(l/90d)-Math.floor(ra/90d))*90d;ra/=15d;double sd=.39782d*Math.sin(rad(l)),cd=Math.cos(Math.asin(sd)),ch=(Math.cos(rad(zenith))-sd*Math.sin(rad(lat)))/(cd*Math.cos(rad(lat)));if(ch>1||ch<-1)return 12d;double h=rising?360d-deg(Math.acos(ch)):deg(Math.acos(ch));h/=15d;double mt=h+ra-.06571d*t-6.622d,ut=norm(mt-lh,24d),offset=date.getTimeZone().getOffset(date.getTimeInMillis())/3600000d;return norm(ut+offset,24d);}
    private static double declination(Calendar date){return rad(23.45d*Math.sin(rad(360d*(284d+date.get(Calendar.DAY_OF_YEAR))/365d)));}
    private static double asr(Calendar date,Config c){double dec=declination(date),angle=deg(Math.atan(1d/(1d+Math.tan(Math.abs(rad(c.lat)-dec)))));return event(date,c.lat,c.lon,90d-angle,false);}
    private static String fmt(double hours,int offset){int total=(int)Math.round(norm(hours*60d+offset,1440d));int h=(total/60)%24,m=total%60;return String.format(java.util.Locale.US,"%02d:%02d",h,m);}
    public static Map<String,String> times(Calendar d,Config c){double rise=event(d,c.lat,c.lon,90.833,true),set=event(d,c.lat,c.lon,90.833,false);Map<String,String> r=new LinkedHashMap<>();r.put("fajr",fmt(event(d,c.lat,c.lon,90+c.fajrAngle,true),c.offsets.get("fajr")));r.put("sunrise",fmt(rise,c.offsets.get("sunrise")));r.put("dhuhr",fmt((rise+set)/2d,c.offsets.get("dhuhr")));r.put("asr",fmt(asr(d,c),c.offsets.get("asr")));r.put("maghrib",fmt(event(d,c.lat,c.lon,90+c.maghribAngle,false),c.offsets.get("maghrib")));r.put("isha",fmt(event(d,c.lat,c.lon,90+c.ishaAngle,false),c.offsets.get("isha")));return r;}
    public static String[] widgetSnapshot(Context context){Config c=load(context);TimeZone tz=TimeZone.getTimeZone(c.timezone);Calendar now=Calendar.getInstance(tz);Map<String,String> t=times(now,c);int cur=now.get(Calendar.HOUR_OF_DAY)*60+now.get(Calendar.MINUTE);String next="فجر "+t.get("fajr");for(int i=0;i<KEYS.length;i++){String v=t.get(KEYS[i]);String[] p=v.split(":");if(Integer.parseInt(p[0])*60+Integer.parseInt(p[1])>cur){next=LABELS[i]+" "+v;break;}}String all="فجر "+t.get("fajr")+"  |  ظهر "+t.get("dhuhr")+"  |  مغرب "+t.get("maghrib")+"  |  عشاء "+t.get("isha");return new String[]{c.location,next,all};}
}
