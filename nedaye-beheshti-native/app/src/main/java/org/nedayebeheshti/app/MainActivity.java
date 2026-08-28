package org.nedayebeheshti.app;

import android.Manifest;
import android.app.Activity;
import android.app.AlarmManager;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.GridLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Calendar;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.util.concurrent.TimeUnit;

public class MainActivity extends Activity implements SensorEventListener {
    private static final int REQ_NOTIFICATIONS=102,REQ_OWNER_IMAGE=501;
    private static final int GREEN=Color.rgb(6,77,55), GOLD=Color.rgb(190,151,69), CREAM=Color.rgb(251,246,237), INK=Color.rgb(39,48,44);
    private SensorManager sensorManager;
    private Sensor rotationSensor;
    private TextView qiblaArrow,qiblaInfo;
    private double heading=0;
    private boolean home=true;
    private int ownerTapCount=0;
    private long ownerTapStart=0;

    @Override protected void onCreate(Bundle state){super.onCreate(state);if(Build.VERSION.SDK_INT>=21){getWindow().setStatusBarColor(GREEN);getWindow().setNavigationBarColor(CREAM);}requestNotificationPermission();startDailyWorker();sensorManager=(SensorManager)getSystemService(SENSOR_SERVICE);rotationSensor=sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);showHome();}

    private int dp(int v){return Math.round(v*getResources().getDisplayMetrics().density);}
    private TextView text(String s,int sp,int color){TextView v=new TextView(this);v.setText(s);v.setTextSize(sp);v.setTextColor(color);v.setGravity(Gravity.RIGHT);v.setPadding(dp(8),dp(6),dp(8),dp(6));v.setLineSpacing(0,1.25f);return v;}
    private TextView heading(String s,int sp){TextView v=text(s,sp,GREEN);v.setTypeface(Typeface.DEFAULT,Typeface.BOLD);return v;}
    private GradientDrawable bg(int color,int radius){GradientDrawable g=new GradientDrawable();g.setColor(color);g.setCornerRadius(dp(radius));g.setStroke(dp(1),Color.rgb(226,213,190));return g;}
    private LinearLayout column(){LinearLayout l=new LinearLayout(this);l.setOrientation(LinearLayout.VERTICAL);l.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);return l;}
    private LinearLayout card(){LinearLayout l=column();l.setPadding(dp(14),dp(14),dp(14),dp(14));l.setBackground(bg(Color.WHITE,20));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.WRAP_CONTENT);p.setMargins(0,0,0,dp(12));l.setLayoutParams(p);return l;}
    private void setPage(LinearLayout body){ScrollView s=new ScrollView(this);s.setFillViewport(true);s.setBackgroundColor(CREAM);LinearLayout outer=column();outer.setPadding(dp(14),dp(12),dp(14),dp(24));outer.addView(body,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.WRAP_CONTENT));s.addView(outer);setContentView(s);}
    private Button action(String label){Button b=new Button(this);b.setText(label);b.setTextSize(15);b.setTextColor(GREEN);b.setAllCaps(false);b.setGravity(Gravity.CENTER);b.setBackground(bg(Color.rgb(255,252,247),16));b.setPadding(dp(8),dp(12),dp(8),dp(12));return b;}
    private void addTopBack(LinearLayout page,String title){LinearLayout row=new LinearLayout(this);row.setOrientation(LinearLayout.HORIZONTAL);row.setGravity(Gravity.CENTER_VERTICAL);row.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);TextView t=heading(title,23);row.addView(t,new LinearLayout.LayoutParams(0,ViewGroup.LayoutParams.WRAP_CONTENT,1));Button back=action("بازگشت");back.setOnClickListener(v->showHome());row.addView(back,new LinearLayout.LayoutParams(dp(100),ViewGroup.LayoutParams.WRAP_CONTENT));page.addView(row);page.addView(space(8));}
    private View space(int h){View v=new View(this);v.setLayoutParams(new LinearLayout.LayoutParams(1,dp(h)));return v;}

    private void showHome(){home=true;qiblaArrow=null;qiblaInfo=null;LinearLayout page=column();TextView title=heading("ندای بهشتی",29);title.setGravity(Gravity.CENTER);title.setPadding(dp(8),dp(8),dp(8),dp(12));title.setOnClickListener(v->{long now=System.currentTimeMillis();if(ownerTapCount==0||now-ownerTapStart>1700){ownerTapStart=now;ownerTapCount=1;}else ownerTapCount++;if(ownerTapCount>=7){ownerTapCount=0;showOwnerLogin();}});page.addView(title);LinearLayout hero=card();hero.setGravity(Gravity.CENTER_VERTICAL);hero.setOrientation(LinearLayout.HORIZONTAL);hero.setLayoutDirection(View.LAYOUT_DIRECTION_LTR);ImageView leader=new ImageView(this);leader.setScaleType(ImageView.ScaleType.CENTER_CROP);loadLeader(leader);LinearLayout.LayoutParams ip=new LinearLayout.LayoutParams(dp(132),dp(160));ip.setMargins(0,0,dp(14),0);hero.addView(leader,ip);LinearLayout htxt=column();TextView n=heading("ندای بهشتی",31);n.setGravity(Gravity.CENTER);TextView sub=text("همراه معنوی شما",16,Color.rgb(82,83,76));sub.setGravity(Gravity.CENTER);htxt.addView(n);htxt.addView(sub);TextView quote=text("راه سعادت، تقوا و پرهیزگاری است.",14,GOLD);quote.setGravity(Gravity.CENTER);quote.setTypeface(Typeface.DEFAULT,Typeface.ITALIC);htxt.addView(space(10));htxt.addView(quote);hero.addView(htxt,new LinearLayout.LayoutParams(0,ViewGroup.LayoutParams.WRAP_CONTENT,1));page.addView(hero);page.addView(prayerCard());GridLayout grid=new GridLayout(this);grid.setColumnCount(2);grid.setUseDefaultMargins(true);String[] labels={"اذان","دعاها","قرآن","تنظیمات","ذکرشمار","قبله‌نما"};for(String label:labels){Button b=action(label);GridLayout.LayoutParams gp=new GridLayout.LayoutParams();gp.width=0;gp.height=dp(86);gp.columnSpec=GridLayout.spec(GridLayout.UNDEFINED,1f);gp.setMargins(dp(4),dp(4),dp(4),dp(4));b.setLayoutParams(gp);if(label.equals("قرآن"))b.setOnClickListener(v->showQuran());else if(label.equals("دعاها"))b.setOnClickListener(v->showDuas());else if(label.equals("ذکرشمار"))b.setOnClickListener(v->showDhikr());else if(label.equals("قبله‌نما"))b.setOnClickListener(v->showQibla());else if(label.equals("تنظیمات"))b.setOnClickListener(v->showSettings());else b.setOnClickListener(v->showAdhan());grid.addView(b);}page.addView(grid);TextView nativeBadge=text("نسخهٔ Native 1.5 — بدون WebView، بدون تبلیغ و بدون دسترسی اینترنت",12,Color.rgb(99,99,93));nativeBadge.setGravity(Gravity.CENTER);nativeBadge.setPadding(8,dp(18),8,8);page.addView(nativeBadge);setPage(page);}

    private LinearLayout prayerCard(){LinearLayout c=card();c.setBackground(bg(GREEN,20));PrayerEngine.Config cfg=PrayerEngine.load(this);Calendar now=Calendar.getInstance(TimeZone.getTimeZone(cfg.timezone));Map<String,String> t=PrayerEngine.times(now,cfg);TextView head=heading("اوقات شرعی — "+cfg.location,18);head.setTextColor(Color.WHITE);head.setGravity(Gravity.CENTER);c.addView(head);String[][] rows={{"فجر",t.get("fajr")},{"طلوع",t.get("sunrise")},{"ظهر",t.get("dhuhr")},{"مغرب",t.get("maghrib")},{"عشاء",t.get("isha")}};LinearLayout row=new LinearLayout(this);row.setOrientation(LinearLayout.HORIZONTAL);row.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);for(String[] r:rows){LinearLayout one=column();TextView a=text(r[0],13,Color.rgb(230,215,176));a.setGravity(Gravity.CENTER);TextView b=text(r[1],16,Color.WHITE);b.setGravity(Gravity.CENTER);b.setTypeface(Typeface.DEFAULT,Typeface.BOLD);one.addView(a);one.addView(b);row.addView(one,new LinearLayout.LayoutParams(0,ViewGroup.LayoutParams.WRAP_CONTENT,1));}c.addView(row);return c;}

    private void showQuran(){home=false;LinearLayout page=column();addTopBack(page,"قرآن کریم — آفلاین");LinearLayout info=card();info.addView(text("متن عربی و ترجمهٔ فارسی داخل خود APK بسته شده است و برای خواندن قرآن اینترنت لازم نیست.",14,INK));page.addView(info);try{JSONObject ar=readJsonAsset("quran_ar.json");JSONArray surahs=ar.getJSONObject("data").getJSONArray("surahs");for(int i=0;i<surahs.length();i++){JSONObject s=surahs.getJSONObject(i);Button b=action((i+1)+". "+s.optString("name")+"  —  "+s.optString("englishName"));final int idx=i;b.setOnClickListener(v->showSurah(idx));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.WRAP_CONTENT);p.setMargins(0,0,0,dp(5));page.addView(b,p);}}catch(Exception e){page.addView(text("فایل قرآن آفلاین در این ساخت پیدا نشد.",15,Color.RED));}setPage(page);}
    private void showSurah(int index){home=false;LinearLayout page=column();try{JSONObject ar=readJsonAsset("quran_ar.json"),fa=readJsonAsset("quran_fa.json");JSONObject sa=ar.getJSONObject("data").getJSONArray("surahs").getJSONObject(index),sf=fa.getJSONObject("data").getJSONArray("surahs").getJSONObject(index);addTopBack(page,sa.optString("name"));JSONArray aa=sa.getJSONArray("ayahs"),ff=sf.getJSONArray("ayahs");for(int i=0;i<aa.length();i++){LinearLayout verse=card();TextView arabic=text(aa.getJSONObject(i).optString("text"),22,INK);arabic.setGravity(Gravity.RIGHT);verse.addView(arabic);if(i<ff.length()){TextView trans=text(ff.getJSONObject(i).optString("text"),15,Color.rgb(73,92,83));trans.setGravity(Gravity.RIGHT);verse.addView(trans);}page.addView(verse);}}catch(Exception e){addTopBack(page,"قرآن");page.addView(text("خواندن سوره ناموفق بود.",15,Color.RED));}setPage(page);}

    private void showDuas(){home=false;LinearLayout page=column();addTopBack(page,"دعاها و نیایش");String[][] d={{"دعای فرج","اَللّهُمَّ کُنْ لِوَلِیِّکَ الْحُجَّةِ بْنِ الْحَسَن...\nخدایا برای ولیّ خود، حجت بن الحسن، در این ساعت و در هر ساعت نگهبان و یاور باش."},{"ذکر صلوات","اَللّهُمَّ صَلِّ عَلیٰ مُحَمَّدٍ وَ آلِ مُحَمَّدٍ"},{"استغفار","اَسْتَغْفِرُ اللهَ رَبّی وَ اَتوبُ اِلَیْهِ"},{"دعای سلامتی","اَللّهُمَّ عافِنا وَ اعْفُ عَنّا وَ ارْحَمْنا بِرَحْمَتِکَ یا اَرْحَمَ الرّاحِمین"},{"زیارت عاشورا — سلام آغازین","اَلسَّلامُ عَلَیْکَ یا اَبا عَبْدِاللهِ، اَلسَّلامُ عَلَیْکَ یَابْنَ رَسُولِ اللهِ..."}};for(String[] item:d){LinearLayout c=card();c.addView(heading(item[0],18));c.addView(text(item[1],17,INK));page.addView(c);}setPage(page);}

    private void showDhikr(){home=false;LinearLayout page=column();addTopBack(page,"ذکرشمار");SharedPreferences p=getSharedPreferences("native_ui",MODE_PRIVATE);final int[] count={p.getInt("dhikr",0)};LinearLayout c=card();TextView n=heading(String.valueOf(count[0]),64);n.setGravity(Gravity.CENTER);c.addView(n);Button plus=action("+ ذکر");plus.setTextSize(24);plus.setOnClickListener(v->{count[0]++;n.setText(String.valueOf(count[0]));p.edit().putInt("dhikr",count[0]).apply();});c.addView(plus);Button reset=action("صفر کردن");reset.setOnClickListener(v->{count[0]=0;n.setText("0");p.edit().putInt("dhikr",0).apply();});c.addView(reset);page.addView(c);setPage(page);}

    private void showQibla(){home=false;LinearLayout page=column();addTopBack(page,"قبله‌نما");LinearLayout c=card();qiblaArrow=heading("↑",108);qiblaArrow.setGravity(Gravity.CENTER);c.addView(qiblaArrow);qiblaInfo=text("در حال خواندن قطب‌نما...",16,INK);qiblaInfo.setGravity(Gravity.CENTER);c.addView(qiblaInfo);TextView note=text("تلفن را افقی و دور از آهنربا/فلز نگه‌دار. جهت پیکان به سوی قبله تنظیم می‌شود.",13,Color.GRAY);note.setGravity(Gravity.CENTER);c.addView(note);page.addView(c);updateQibla();setPage(page);}
    private double qiblaBearing(){PrayerEngine.Config c=PrayerEngine.load(this);double lat1=Math.toRadians(c.lat),lat2=Math.toRadians(21.4225),dlon=Math.toRadians(39.8262-c.lon);double y=Math.sin(dlon)*Math.cos(lat2),x=Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(dlon);double b=Math.toDegrees(Math.atan2(y,x));return (b+360)%360;}
    private void updateQibla(){if(qiblaArrow==null)return;double q=qiblaBearing();qiblaArrow.setRotation((float)(q-heading));if(qiblaInfo!=null)qiblaInfo.setText(String.format(Locale.US,"جهت قبله %.0f° — قطب‌نما %.0f°",q,heading));}

    private void showAdhan(){home=false;LinearLayout page=column();addTopBack(page,"اذان");LinearLayout c=card();c.addView(text("اذان پیش‌فرض داخل خود APK قرار دارد. پخش اذان برای زمان‌های نماز توسط سرویس بومی Android انجام می‌شود.",15,INK));Button normal=action("پخش آزمایشی اذان");normal.setOnClickListener(v->startAdhan("dhuhr","نماز"));c.addView(normal);Button fajr=action("پخش آزمایشی اذان صبح");fajr.setOnClickListener(v->startAdhan("fajr","فجر"));c.addView(fajr);Button exact=action("اجازهٔ هشدار دقیق");exact.setOnClickListener(v->requestExactAlarm());c.addView(exact);page.addView(c);setPage(page);}
    private void startAdhan(String key,String label){Intent i=new Intent(this,AdhanPlaybackService.class).putExtra("prayerKey",key).putExtra("label",label);if(Build.VERSION.SDK_INT>=26)startForegroundService(i);else startService(i);}

    private EditText field(String value,String hint){EditText e=new EditText(this);e.setText(value);e.setHint(hint);e.setTextSize(15);e.setTextColor(INK);e.setSingleLine(true);e.setBackground(bg(Color.WHITE,12));e.setPadding(dp(12),dp(10),dp(12),dp(10));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.WRAP_CONTENT);p.setMargins(0,0,0,dp(8));e.setLayoutParams(p);return e;}
    private void showSettings(){home=false;LinearLayout page=column();addTopBack(page,"تنظیمات");PrayerEngine.Config c=PrayerEngine.load(this);LinearLayout box=card();EditText loc=field(c.location,"نام شهر");EditText lat=field(String.valueOf(c.lat),"عرض جغرافیایی");EditText lon=field(String.valueOf(c.lon),"طول جغرافیایی");EditText tz=field(c.timezone,"منطقه زمانی؛ مثلا Asia/Kabul");EditText pre=field(String.valueOf(c.preAlert),"هشدار قبل از نماز (دقیقه)");Switch vibrate=new Switch(this);vibrate.setText("لرزش هشدار");vibrate.setChecked(c.vibration);vibrate.setTextColor(INK);box.addView(loc);box.addView(lat);box.addView(lon);box.addView(tz);box.addView(pre);box.addView(vibrate);Button save=action("ذخیره و تنظیم هشدارهای نماز");save.setOnClickListener(v->{try{JSONObject o=new JSONObject();o.put("locationName",loc.getText().toString().trim());o.put("lat",Double.parseDouble(lat.getText().toString()));o.put("lon",Double.parseDouble(lon.getText().toString()));o.put("timezone",tz.getText().toString().trim());o.put("preAlertMinutes",Integer.parseInt(pre.getText().toString()));o.put("vibration",vibrate.isChecked());o.put("adhanEnabled",true);o.put("fajrAngle",16);o.put("maghribAngle",4);o.put("ishaAngle",14);JSONObject alerts=new JSONObject();for(String k:new String[]{"fajr","dhuhr","asr","maghrib","isha"})alerts.put(k,true);o.put("prayerAlerts",alerts);PrayerEngine.saveAndSchedule(this,o.toString());Toast.makeText(this,"تنظیمات ذخیره شد",Toast.LENGTH_SHORT).show();showHome();}catch(Exception ex){Toast.makeText(this,"مختصات یا زمان را درست وارد کن",Toast.LENGTH_LONG).show();}});box.addView(save);page.addView(box);setPage(page);}

    private void showOwnerLogin(){final SharedPreferences p=getSharedPreferences("owner_local",MODE_PRIVATE);final boolean first=p.getString("password_hash","").isEmpty();EditText input=new EditText(this);input.setSingleLine(true);input.setInputType(0x00000081);new AlertDialog.Builder(this).setTitle(first?"ساخت رمز مالک":"ورود مدیریت مالک").setMessage(first?"این اولین ورود است؛ رمزی که اکنون تعیین کنی فقط روی همین نصب ذخیره می‌شود.":"رمز مالک را وارد کن.").setView(input).setNegativeButton("لغو",null).setPositiveButton(first?"ثبت رمز":"ورود",(d,w)->{String pass=input.getText().toString();if(pass.length()<4){Toast.makeText(this,"رمز حداقل ۴ نویسه باشد",Toast.LENGTH_LONG).show();return;}String hash=sha256(pass);if(first){p.edit().putString("password_hash",hash).apply();showOwnerConsole();}else if(hash.equals(p.getString("password_hash","")))showOwnerConsole();else Toast.makeText(this,"رمز نادرست است",Toast.LENGTH_LONG).show();}).show();}
    private void showOwnerConsole(){home=false;LinearLayout page=column();addTopBack(page,"مدیریت مالک");LinearLayout c=card();c.addView(text("این پنل کاملاً محلی است؛ هیچ رمز یا تصویری به سرور دیگری ارسال نمی‌شود.",14,INK));Button image=action("تغییر تصویر رهبر داخل اپ");image.setOnClickListener(v->{Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.setType("image/*");i.addCategory(Intent.CATEGORY_OPENABLE);startActivityForResult(i,REQ_OWNER_IMAGE);});c.addView(image);Button remove=action("بازگرداندن تصویر پیش‌فرض");remove.setOnClickListener(v->{File f=new File(getFilesDir(),"leader_custom.img");if(f.exists())f.delete();Toast.makeText(this,"تصویر پیش‌فرض برگشت",Toast.LENGTH_SHORT).show();showHome();});c.addView(remove);Button reset=action("تغییر رمز مالک");reset.setOnClickListener(v->{getSharedPreferences("owner_local",MODE_PRIVATE).edit().remove("password_hash").apply();Toast.makeText(this,"رمز حذف شد؛ ورود بعدی رمز تازه می‌سازد",Toast.LENGTH_LONG).show();showHome();});c.addView(reset);page.addView(c);setPage(page);}
    private String sha256(String s){try{MessageDigest d=MessageDigest.getInstance("SHA-256");byte[] b=d.digest(s.getBytes(StandardCharsets.UTF_8));StringBuilder x=new StringBuilder();for(byte v:b)x.append(String.format(Locale.US,"%02x",v));return x.toString();}catch(Exception e){return s;}}

    private void loadLeader(ImageView v){File custom=new File(getFilesDir(),"leader_custom.img");if(custom.exists())v.setImageURI(Uri.fromFile(custom));else v.setImageResource(R.drawable.leader);}
    @Override protected void onActivityResult(int requestCode,int resultCode,Intent data){super.onActivityResult(requestCode,resultCode,data);if(requestCode==REQ_OWNER_IMAGE&&resultCode==RESULT_OK&&data!=null&&data.getData()!=null){try(InputStream in=getContentResolver().openInputStream(data.getData());FileOutputStream out=new FileOutputStream(new File(getFilesDir(),"leader_custom.img"))){byte[] buf=new byte[8192];int n;while((n=in.read(buf))>0)out.write(buf,0,n);Toast.makeText(this,"تصویر رهبر ذخیره شد",Toast.LENGTH_SHORT).show();showHome();}catch(Exception e){Toast.makeText(this,"ذخیره تصویر ناموفق بود",Toast.LENGTH_LONG).show();}}}

    private JSONObject readJsonAsset(String name)throws Exception{try(InputStream in=getAssets().open(name);ByteArrayOutputStream out=new ByteArrayOutputStream()){byte[] b=new byte[16384];int n;while((n=in.read(b))>0)out.write(b,0,n);return new JSONObject(out.toString("UTF-8"));}}
    private void startDailyWorker(){PeriodicWorkRequest req=new PeriodicWorkRequest.Builder(DailyScheduleWorker.class,12,TimeUnit.HOURS).build();WorkManager.getInstance(this).enqueueUniquePeriodicWork("nedaye-prayer-refresh",ExistingPeriodicWorkPolicy.UPDATE,req);}
    private void requestNotificationPermission(){if(Build.VERSION.SDK_INT>=33&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},REQ_NOTIFICATIONS);}
    private void requestExactAlarm(){if(Build.VERSION.SDK_INT>=31){AlarmManager a=(AlarmManager)getSystemService(ALARM_SERVICE);if(!a.canScheduleExactAlarms())try{startActivity(new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,Uri.parse("package:"+getPackageName())));}catch(Exception ignored){}}}
    @Override protected void onResume(){super.onResume();if(rotationSensor!=null)sensorManager.registerListener(this,rotationSensor,SensorManager.SENSOR_DELAY_UI);}
    @Override protected void onPause(){if(sensorManager!=null)sensorManager.unregisterListener(this);super.onPause();}
    @Override public void onSensorChanged(SensorEvent event){if(event.sensor.getType()!=Sensor.TYPE_ROTATION_VECTOR)return;float[] matrix=new float[9],orientation=new float[3];SensorManager.getRotationMatrixFromVector(matrix,event.values);SensorManager.getOrientation(matrix,orientation);double az=Math.toDegrees(orientation[0]);if(az<0)az+=360;heading=az;updateQibla();}
    @Override public void onAccuracyChanged(Sensor sensor,int accuracy){}
    @Override public void onBackPressed(){if(!home)showHome();else super.onBackPressed();}
}
